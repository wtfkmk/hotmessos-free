// resumeLogic.ts - Smart navigation utilities for Hot Mess OS
// CORRECTED VERSION for your actual database schema

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type DiagnosticProgress = {
  hasPaid: boolean;
  profileComplete: boolean;
  businessComplete: boolean;
  pillarComplete: boolean;
  reportComplete: boolean;
};

export type ResumeScreen = 
  | 'paid_diagnostic_gate'
  | 'paid_diagnostic_profile'
  | 'paid_diagnostic_business'
  | 'paid_diagnostic_pillars'
  | 'paid_diagnostic_loading'
  | 'paid_diagnostic_report';

/**
 * Get user's diagnostic progress from database
 */
export async function getDiagnosticProgress(email: string): Promise<DiagnosticProgress | null> {
  if (!email) return null;

  try {
    // Check if user has paid diagnostic
    const { data: paidData, error: paidError } = await supabase
      .from('paid_diagnostics')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (paidError) {
      console.error('Error fetching diagnostic:', paidError);
    }

    if (!paidData) {
      // User hasn't paid
      return {
        hasPaid: false,
        profileComplete: false,
        businessComplete: false,
        pillarComplete: false,
        reportComplete: false
      };
    }

    // Check profile completion from user_profiles table
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    const profileComplete = !!profileData && 
      !!profileData.business_models && 
      !!profileData.elevator_pitch;

    const businessComplete = !!paidData.business_deep_dive;
    const pillarComplete = !!paidData.pillar_responses;
    const reportComplete = !!paidData.report_data;

    return {
      hasPaid: true,
      profileComplete,
      businessComplete,
      pillarComplete,
      reportComplete
    };

  } catch (error) {
    console.error('Error getting diagnostic progress:', error);
    return null;
  }
}

/**
 * Determine which screen to show based on progress
 */
export function getResumeScreen(progress: DiagnosticProgress | null): ResumeScreen {
  if (!progress || !progress.hasPaid) {
    return 'paid_diagnostic_gate';
  }

  // Profile not complete - go to profile setup
  if (!progress.profileComplete) {
    return 'paid_diagnostic_profile';
  }

  // Business deep dive not complete
  if (!progress.businessComplete) {
    return 'paid_diagnostic_business';
  }

  // Pillar assessment not complete
  if (!progress.pillarComplete) {
    return 'paid_diagnostic_pillars';
  }

  // Report generation needed
  if (!progress.reportComplete) {
    return 'paid_diagnostic_loading';
  }

  // Everything complete - show report
  return 'paid_diagnostic_report';
}

/**
 * Main function to call when user wants to resume/start diagnostic
 * Returns the screen they should navigate to
 */
export async function getResumePath(email: string): Promise<ResumeScreen> {
  // Check if paid
  const { data: paidData } = await supabase
    .from('paid_diagnostics')
    .select('business_deep_dive, business_completed, pillar_responses, pillar_completed, report_data')
    .eq('email', email)
    .maybeSingle();

  if (!paidData) return 'paid_diagnostic_gate';

  // Check profile
  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('business_models, elevator_pitch')
    .eq('email', email)
    .maybeSingle();

  const profileComplete = profileData?.business_models && profileData?.elevator_pitch;

  if (!profileComplete) {
    return 'paid_diagnostic_profile';
  }

  // Check business deep dive COMPLETION FLAG
  if (!paidData.business_completed) {
    return 'paid_diagnostic_business';
  }

  // Check pillar assessment COMPLETION FLAG
  if (!paidData.pillar_completed) {
    return 'paid_diagnostic_pillars';
  }

  // Check report generation
  if (!paidData.report_data) {
    return 'paid_diagnostic_loading';
  }

  // All complete - show report
  return 'paid_diagnostic_report';
}

/**
 * Save partial progress for business deep dive
 */
export async function saveBusinessProgress(
  email: string, 
  stepCompleted: number, 
  data: any,
  isComplete: boolean = false
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('paid_diagnostics')
      .update({
        business_deep_dive: data,
        business_step_completed: stepCompleted,
        business_completed: isComplete,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error saving business progress:', error);
      return false;
    }

    console.log(`✅ Saved business progress: Step ${stepCompleted}, Complete: ${isComplete}`);
    return true;
  } catch (error) {
    console.error('Error saving business progress:', error);
    return false;
  }
}
/**
 * Save partial progress for pillar assessment
 */
export async function savePillarProgress(
  email: string, 
  stepCompleted: number, 
  data: any,
  isComplete: boolean = false
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('paid_diagnostics')
      .update({
        pillar_responses: data,
        pillar_step_completed: stepCompleted,
        pillar_completed: isComplete,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (error) {
      console.error('Error saving pillar progress:', error);
      return false;
    }

    console.log(`✅ Saved pillar progress: Step ${stepCompleted}, Complete: ${isComplete}`);
    return true;
  } catch (error) {
    console.error('Error saving pillar progress:', error);
    return false;
  }
}

/**
 * Load pillar assessment progress
 */
export async function loadPillarProgress(email: string): Promise<{
  step: number;
  data: any;
  isComplete: boolean;
} | null> {
  try {
    const { data, error } = await supabase
      .from('paid_diagnostics')
      .select('pillar_step_completed, pillar_responses, pillar_completed')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      step: data.pillar_step_completed || 0,
      data: data.pillar_responses || {},
      isComplete: !!data.pillar_completed,
    };
  } catch (error) {
    console.error('Error loading pillar progress:', error);
    return null;
  }
}
/**
 * Load partial progress to resume where user left off
 */
export async function loadBusinessProgress(email: string): Promise<{
  step: number;
  data: any;
} | null> {
  try {
    const { data, error } = await supabase
      .from('paid_diagnostics')
      .select('business_step_completed, business_deep_dive')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return {
      step: data.business_step_completed || 0,
      data: data.business_deep_dive || {}
    };
  } catch (error) {
    console.error('Error loading business progress:', error);
    return null;
  }
}