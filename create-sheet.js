const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');

async function createSheet() {
  try {
    // Load service account
    const serviceAccountAuth = new JWT({
      email: JSON.parse(fs.readFileSync('./plated-axon-436716-d6-d82d02ef7664.json')).client_email,
      key: JSON.parse(fs.readFileSync('./plated-axon-436716-d6-d82d02ef7664.json')).private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    // Create new spreadsheet
    const doc = new GoogleSpreadsheet(null, serviceAccountAuth);
    
    await doc.createNewSpreadsheetDocument({
      title: 'Email Collection - Landing Page'
    });
    
    console.log('Created spreadsheet:', doc.spreadsheetId);
    console.log('URL:', `https://docs.google.com/spreadsheets/d/${doc.spreadsheetId}/edit`);
    
    // Add headers to the first sheet
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.updateProperties({ title: 'Landing Page' });
    await sheet.setHeaderRow(['Email', 'Timestamp', 'Source']);
    
    console.log('Sheet configured with headers');
    
    // Test adding a row
    await sheet.addRow({
      Email: 'test@example.com',
      Timestamp: new Date().toISOString(),
      Source: 'Test Entry'
    });
    
    console.log('Test row added successfully');
    console.log('Spreadsheet ID:', doc.spreadsheetId);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createSheet();