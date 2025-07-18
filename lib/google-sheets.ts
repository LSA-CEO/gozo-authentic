import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Initialize auth from service account
const auth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID!;

// Partner to sheet mapping
const PARTNER_SHEETS = {
  'joseph-quad': 'Joseph',
  'lorenzo-boat': 'Lorenzo',
  'chris-jetski': 'Boat',
  'restaurant': 'Restaurant'
} as const;

export type PartnerType = keyof typeof PARTNER_SHEETS;

interface LeadData {
  reference_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  preferred_date?: string;
  guests: number;
  message?: string;
  status: 'sent' | 'confirmed' | 'completed';
  partner_type: PartnerType;
}

export async function appendLeadToPartnerSheet(lead: LeadData) {
  try {
    const sheetName = PARTNER_SHEETS[lead.partner_type];
    
    if (!sheetName) {
      throw new Error(`Invalid partner type: ${lead.partner_type}`);
    }

    // Format the date
    const currentDate = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/Malta',
      dateStyle: 'short',
      timeStyle: 'short'
    });

    // Prepare row data
    const rowData = [
      currentDate,
      lead.reference_code,
      lead.customer_name,
      lead.customer_phone,
      lead.customer_email || '',
      lead.preferred_date || '',
      lead.guests.toString(),
      lead.message || '',
      lead.status
    ];

    // Append to the specific partner sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A:I`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData]
      }
    });

    console.log(`Lead ${lead.reference_code} added to ${sheetName} sheet`);
    return response.data;

  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

export async function updateLeadStatus(
  reference_code: string, 
  partner_type: PartnerType,
  new_status: 'sent' | 'confirmed' | 'completed'
) {
  try {
    const sheetName = PARTNER_SHEETS[partner_type];
    
    // First, find the row with this reference code
    const searchResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!B:B`, // Column B contains reference codes
    });

    const values = searchResponse.data.values;
    if (!values) {
      throw new Error('No data found in sheet');
    }

    // Find the row index (adding 1 because sheets are 1-indexed)
    const rowIndex = values.findIndex(row => row[0] === reference_code) + 1;
    
    if (rowIndex === 0) {
      throw new Error(`Reference code ${reference_code} not found`);
    }

    // Update the status column (column I)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!I${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new_status]]
      }
    });

    console.log(`Updated status for ${reference_code} to ${new_status}`);
    return { success: true };

  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
}

// Function to get all leads for a specific partner (useful for partner dashboard)
export async function getPartnerLeads(partner_type: PartnerType) {
  try {
    const sheetName = PARTNER_SHEETS[partner_type];
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${sheetName}'!A2:I`, // Skip header row
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Convert rows to objects
    return rows.map(row => ({
      date: row[0] || '',
      reference_code: row[1] || '',
      customer_name: row[2] || '',
      customer_phone: row[3] || '',
      customer_email: row[4] || '',
      preferred_date: row[5] || '',
      guests: parseInt(row[6]) || 1,
      message: row[7] || '',
      status: row[8] || 'sent'
    }));

  } catch (error) {
    console.error('Error fetching partner leads:', error);
    throw error;
  }
}

// Initialize sheets with headers if empty (run once)
export async function initializeSheets() {
  try {
    const headers = [
      ['Date', 'Reference', 'Customer Name', 'Phone', 'Email', 'Preferred Date', 'Guests', 'Message', 'Status']
    ];

    for (const sheetName of Object.values(PARTNER_SHEETS)) {
      // Check if sheet has headers
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${sheetName}'!A1:I1`,
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `'${sheetName}'!A1:I1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: headers
          }
        });
        console.log(`Initialized headers for ${sheetName}`);
      }
    }
  } catch (error) {
    console.error('Error initializing sheets:', error);
  }
}