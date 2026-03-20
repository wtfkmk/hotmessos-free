// resumeLogic.ts - Smart navigation utilities for Hot Mess OS

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
export async function getDiagnosticProgress(userId: string): Promise<DiagnosticProgress | null> {
  if (!userId) return null;

  try {
    const { data: paidData, error: paidError } = await supabase
      .from('paid_diagnostics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (paidError) {
      console.error('Error fetching diagnostic:', paidError);
    }

    if (!paidData) {
      return {
        hasPaid: false,
        profileComplete: false,
        businessComplete: false,
        pillarComplete: false,
        reportComplete: false
      };
    }

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const profileComplete = !!profileData &&
      !!profileData.business_models &&
      !!profileData.elevator_pitch;

    return {
      hasPaid: true,
      profileComplete,
      businessComplete: !!paidData.business_deep_dive,
      pillarComplete: !!paidData.pillar_responses,
      reportComplete: !!paidData.report_data
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
  if (!progress || !progress.hasPaid) return 'paid_diagnostic_gate';
  if (!progress.profileComplete) return 'paid_diagnostic_profile';
  if (!progress.businessComplete) return 'paid_diagnostic_business';
  if (!progress.pillarComplete) return 'paid_diagnostic_pillars';
  if (!progress.reportComplete) return 'paid_diagnostic_loading';
  return 'paid_diagnostic_report';
}

export type ResumeResult = {
  screen: ResumeScreen;
  diagnosticId: string | null;
};

/**
 * Main function to call when user wants to resume/start diagnostic.
 * Returns both the screen to navigate to and the active diagnostic's ID.
 */
export async function getResumePath(userId: string): Promise<ResumeResult> {
  // Pick the most recent non-completed diagnostic for this user
  const { data: paidData } = await supabase
    .from('paid_diagnostics')
    .select('id, business_deep_dive, business_completed, pillar_responses, pillar_completed, report_data')
    .eq('user_id', userId)
    .in('status', ['pending', 'processing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!paidData) return { screen: 'paid_diagnostic_gate', diagnosticId: null };

  const { data: profileData } = await supabase
    .from('user_profiles')
    .select('business_models, elevator_pitch')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profileData?.business_models || !profileData?.elevator_pitch) {
    return { screen: 'paid_diagnostic_profile', diagnosticId: paidData.id };
  }

  if (!paidData.business_completed) return { screen: 'paid_diagnostic_business', diagnosticId: paidData.id };
  if (!paidData.pillar_completed) return { screen: 'paid_diagnostic_pillars', diagnosticId: paidData.id };
  if (!paidData.report_data) return { screen: 'paid_diagnostic_loading', diagnosticId: paidData.id };

  return { screen: 'paid_diagnostic_report', diagnosticId: paidData.id };
}

/**
 * Save partial progress for business deep dive
 */
export async function saveBusinessProgress(
  userId: string,
  stepCompleted: number,
  data: any,
  isComplete: boolean = false,
  diagnosticId?: string | null
): Promise<boolean> {
  try {
    let query = supabase
      .from('paid_diagnostics')
      .update({
        business_deep_dive: data,
        business_step_completed: stepCompleted,
        business_completed: isComplete,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    if (diagnosticId) query = query.eq('id', diagnosticId);
    const { error } = await query;

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
  userId: string,
  stepCompleted: number,
  data: any,
  isComplete: boolean = false,
  diagnosticId?: string | null
): Promise<boolean> {
  try {
    let query = supabase
      .from('paid_diagnostics')
      .update({
        pillar_responses: data,
        pillar_step_completed: stepCompleted,
        pillar_completed: isComplete,
        last_saved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    if (diagnosticId) query = query.eq('id', diagnosticId);
    const { error } = await query;

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
export async function loadPillarProgress(userId: string, diagnosticId?: string | null): Promise<{
  step: number;
  data: any;
  isComplete: boolean;
} | null> {
  try {
    let query = supabase
      .from('paid_diagnostics')
      .select('pillar_step_completed, pillar_responses, pillar_completed')
      .eq('user_id', userId);
    if (diagnosticId) query = query.eq('id', diagnosticId);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

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
export async function loadBusinessProgress(userId: string, diagnosticId?: string | null): Promise<{
  step: number;
  data: any;
} | null> {
  try {
    let query = supabase
      .from('paid_diagnostics')
      .select('business_step_completed, business_deep_dive')
      .eq('user_id', userId);
    if (diagnosticId) query = query.eq('id', diagnosticId);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();

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
