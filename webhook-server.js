const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 9999;

app.use(cors());
app.use(express.json());

// Load Google Service Account credentials
const serviceAccountAuth = new JWT({
  email: JSON.parse(fs.readFileSync('./plated-axon-436716-d6-d82d02ef7664.json')).client_email,
  key: JSON.parse(fs.readFileSync('./plated-axon-436716-d6-d82d02ef7664.json')).private_key,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

// Webhook endpoint for email collection
app.post('/webhook/email-signup', async (req, res) => {
  try {
    console.log('Received email submission:', req.body);
    
    const { email, timestamp, source } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Save to CSV file for now
    const csvLine = `${email},${timestamp || new Date().toISOString()},${source || 'Landing Page'}\n`;
    
    // Check if file exists, if not create headers
    if (!fs.existsSync('emails.csv')) {
      fs.writeFileSync('emails.csv', 'Email,Timestamp,Source\n');
    }
    
    // Append the new email
    fs.appendFileSync('emails.csv', csvLine);
    
    console.log(`✅ Email saved to CSV: ${email} at ${timestamp} from ${source}`);
    
    // Also try Google Sheets but don't fail if it doesn't work
    try {
      const doc = new GoogleSpreadsheet('1P_TBeWpFYoX3Y65QO-R-1cKNjEHK_cHgDFg6QFdWYPE', serviceAccountAuth);
      await doc.loadInfo();
      
      let sheet = doc.sheetsByTitle['Landing Page'];
      if (!sheet) {
        sheet = await doc.addSheet({ title: 'Landing Page' });
        await sheet.setHeaderRow(['Email', 'Timestamp', 'Source']);
      }
      
      await sheet.addRow({
        Email: email,
        Timestamp: timestamp || new Date().toISOString(),
        Source: source || 'Landing Page'
      });
      
      console.log(`✅ Email also added to Google Sheets: ${email}`);
    } catch (sheetsError) {
      console.log(`⚠️ Google Sheets failed (but CSV worked): ${sheetsError.message}`);
    }
    
    res.json({ success: true, message: 'Email saved successfully' });
    
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Webhook server is running' });
});

app.listen(PORT, () => {
  console.log(`Webhook server running on http://localhost:${PORT}`);
  console.log('Ready to receive email submissions at /webhook/email-signup');
});