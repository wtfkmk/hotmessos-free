import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Mark profile as confirmed in paid_diagnostics
    const { data, error } = await supabase
      .from('paid_diagnostics')
      .update({
        profile_confirmed: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error confirming profile:', error);
      return NextResponse.json(
        { error: 'Failed to confirm profile' },
        { status: 500 }
      );
    }

    // Also update user_profiles with confirmation timestamp
    await supabase
      .from('user_profiles')
      .update({
        profile_confirmed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('email', email);

    // Log activity
    await supabase
      .from('activity_log')
      .insert({
        email,
        activity_type: 'profile_confirmed',
        activity_title: 'Profile Confirmed',
        activity_description: 'Confirmed profile information before starting diagnostic',
        section: 'profile',
        metadata: { confirmed_at: new Date().toISOString() }
      });

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}