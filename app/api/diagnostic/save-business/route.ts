import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
const { email, businessDeepDive, markComplete } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('paid_diagnostics')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing record
      const result = await supabase
  .from('paid_diagnostics')
  .update({
    business_deep_dive: businessDeepDive,
    business_completed: markComplete === true,  // ← ADD THIS LINE
    updated_at: new Date().toISOString()
  })
  .eq('email', email)
  .select()
  .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('paid_diagnostics')
        .insert({
          email,
          business_deep_dive: businessDeepDive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save business deep dive data', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}