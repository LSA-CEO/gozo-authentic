import { NextResponse } from 'next/server';
import { appendLeadToPartnerSheet, initializeSheets } from '../../../lib/google-sheets';

export async function GET() {
  try {
    // Initialize sheets with headers
    await initializeSheets();
    
    // Test lead
    const testLead = {
      reference_code: 'TEST-' + Date.now(),
      customer_name: 'Test Customer',
      customer_phone: '+356 9999 9999',
      customer_email: 'test@example.com',
      preferred_date: '2024-12-20',
      guests: 2,
      message: 'This is a test lead from the API',
      status: 'sent' as const,
      partner_type: 'joseph-quad' as const
    };

    await appendLeadToPartnerSheet(testLead);

    return NextResponse.json({ 
      success: true, 
      message: 'Test lead added to Google Sheets',
      lead: testLead 
    });

  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}