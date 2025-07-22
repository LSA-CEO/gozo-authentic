import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { appendLeadToPartnerSheet } from '../../../lib/google-sheets';

// Map experience IDs to partner types for Google Sheets
const EXPERIENCE_TO_PARTNER: Record<string, any> = {
  '1': 'joseph-quad',
  '2': 'lorenzo-boat', 
  '3': 'chris-jetski',
  '4': 'restaurant'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Insert into Supabase
    const { data: lead, error: dbError } = await supabase
      .from('leads')
      .insert({
        experience_id: body.experience_id,
        reference_code: body.reference_code,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        preferred_date: body.preferred_date,
        guests: body.guests,
        message: body.message,
        status: 'sent'
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
    }
    
    // Log to Google Sheets
    try {
      const partnerType = EXPERIENCE_TO_PARTNER[body.experience_id] || 'joseph-quad';
      
      await appendLeadToPartnerSheet({
        reference_code: body.reference_code,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        preferred_date: body.preferred_date,
        guests: body.guests,
        message: body.message,
        status: 'sent',
        partner_type: partnerType
      });
    } catch (sheetsError) {
      console.error('Google Sheets error:', sheetsError);
      // Continue even if Sheets fails
    }
    
    // Track commission (private)
    await supabase
      .from('commission_tracking')
      .insert({
        lead_reference: body.reference_code,
        partner_id: body.experience_id,
        commission_rate: 0.15, // 15% default
        expected_amount: 0, // To be calculated later
        cash_collected: false
      });
    
    return NextResponse.json({ 
      success: true, 
      lead: lead,
      reference: body.reference_code 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');
  
  if (!reference) {
    return NextResponse.json({ error: 'Reference required' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('leads')
    .select('*, experiences(name_en, name_fr)')
    .eq('reference_code', reference)
    .single();
  
  if (error || !data) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  
  return NextResponse.json({ lead: data });
}
