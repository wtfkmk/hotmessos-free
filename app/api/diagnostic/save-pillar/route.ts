import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email, pillarData, markComplete } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!pillarData) {
      return NextResponse.json(
        { error: 'Pillar data is required' },
        { status: 400 }
      );
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('paid_diagnostics')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { error: 'No diagnostic record found. Please complete payment first.' },
        { status: 404 }
      );
    }

    // Update existing record with pillar data
    const { data, error } = await supabase
      .from('paid_diagnostics')
      .update({
        ...pillarData,
        pillar_completed: markComplete === true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save pillar assessment data', details: error.message },
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