// Google Apps Script code - paste this at script.google.com

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Open your Google Sheet by ID
    const sheet = SpreadsheetApp.openById('1P_TBeWpFYoX3Y65QO-R-1cKNjEHK_cHgDFg6QFdWYPE');
    
    // Get or create the "Landing Page" worksheet
    let worksheet = sheet.getSheetByName('Landing Page');
    if (!worksheet) {
      worksheet = sheet.insertSheet('Landing Page');
      // Add headers
      worksheet.getRange(1, 1, 1, 3).setValues([['Email', 'Timestamp', 'Source']]);
    }
    
    // Add the new email data
    worksheet.appendRow([
      data.email,
      data.timestamp || new Date().toISOString(),
      data.source || 'Landing Page'
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Email added successfully'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doGet(e) {
  // Handle OPTIONS request for CORS
  return ContentService
    .createTextOutput(JSON.stringify({message: 'GET request received'}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}