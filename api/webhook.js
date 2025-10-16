const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Parse the service account key from environment variable
const getServiceAccountAuth = () => {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable');
  }
  
  const credentials = JSON.parse(serviceAccountKey);
  return new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email, timestamp, source } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    console.log('Received email submission:', { email, timestamp, source });
    
    // Try to save to Google Sheets
    try {
      const serviceAccountAuth = getServiceAccountAuth();
      const doc = new GoogleSpreadsheet('1P_TBeWpFYoX3Y65QO-R-1cKNjEHK_cHgDFg6QFdWYPE', serviceAccountAuth);
      await doc.loadInfo();
      
      // Get or create the "Landing Page" sheet
      let sheet = doc.sheetsByTitle['Landing Page'];
      if (!sheet) {
        sheet = await doc.addSheet({ title: 'Landing Page' });
        await sheet.setHeaderRow(['Email', 'Timestamp', 'Source']);
      } else {
        // Check if headers exist
        await sheet.loadHeaderRow();
        if (!sheet.headerValues || sheet.headerValues.length === 0) {
          await sheet.setHeaderRow(['Email', 'Timestamp', 'Source']);
        }
      }
      
      // Add the new row
      await sheet.addRow({
        Email: email,
        Timestamp: timestamp || new Date().toISOString(),
        Source: source || 'Landing Page'
      });
      
      console.log('✅ Email added to Google Sheets:', email);
      res.json({ success: true, message: 'Email added to Google Sheets successfully' });
      
    } catch (sheetsError) {
      console.log('⚠️ Google Sheets failed:', sheetsError.message);
      // For now, still return success even if Sheets fails
      res.json({ success: true, message: 'Email received (Sheets unavailable)' });
    }
    
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ error: 'Failed to process email', details: error.message });
  }
}