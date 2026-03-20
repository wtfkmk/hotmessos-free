"use client";

import React, { useState, useEffect } from 'react';
import { savePillarProgress, loadPillarProgress } from '@/lib/resumeLogic';

interface PillarAssessmentProps {
  userEmail: string;
  onComplete: (data: PillarData) => void;
  onBack?: () => void;
  onSaveAndExit: () => void;
  onPillarTransition?: (nextPillar: number) => void;
  resumePillar?: number;
}

interface PillarData {
  // PRESENCE (9 questions)
  p_q1_inner_voice: string;
  p_q2_evolution: string;
  p_q3_chaos_clarity: string;
  p_q4_follow_through: number;
  p_q6_physical_presence: number;
  p_q8_presence_quality: string;
  p_q9_energy_management: number;
  p_q10_creation_mode: string;
  p_q11_consistency_volatility: string;

  // DIGITAL SELF (17 questions)
  ds_q1_file_organization: number;
  ds_q2_problem_identification: string;
  ds_q3_ai_quality_control: number;
  ds_q4_tool_selection: string;
  ds_q5_ai_explainability: string;
  ds_q6_ai_integration: string;
  ds_q7_technical_fluency: number;
  ds_q8_system_resilience: string;
  ds_q8_5_automation: string;
  ds_q9_baseline_monitoring: string;
  ds_q10_brand_evolution: string;
  ds_q11_ai_power_dynamic: string;
  ds_q12_data_boundaries: string[];
  ds_q12_follow_up: string;
  ds_q13_strength_alignment: string;
  ds_q15_past_wave: string;
  ds_q16_failure_recovery: string;
  ds_q17_content_leverage: string;

  // RELATIONSHIPS (19 questions)
  r_q2_emotional_awareness: string;
  r_q3_regulation_stress: string;
  r_q4_deep_work: number;
  r_q5_communication_clarity: string;
  r_q6_conflict_pattern: string;
  r_q7_online_feedback: string;
  r_q8_mentor_presence: string;
  r_q9_boundaries: number;
  r_q10_reciprocity: string;
  r_q11_energy_distribution: string[];
  r_q12_network_elevation: string;
  r_q12_follow_up: string;
  r_q13_network_alignment: string;
  r_q14_resilience_flattery: string;
  r_q15_people_energy: string;
  r_q16_collaboration: string;
  r_q17_earning_relationship: string;
  r_q17_follow_up: number;
  r_q18_sales_comfort: string;

  // CREATIVE FLOW (16 questions)
  cf_q1_natural_gifts: string[];
  cf_q3_learning_appetite: string;
  cf_q4_creative_consistency: string;
  cf_q5_creation_source: string;
  cf_q6_artistic_maturity: string;
  cf_q7_creation_intent: string;
  cf_q8_ai_flow: number;
  cf_q9_security_individuality: string;
  cf_q10_content_areas: string[];
  cf_q11_perspective_flexibility: string;
  cf_q12_path_awareness: string;
  cf_q13_creative_fulfillment: string;
  cf_q14_creative_blocks: string[];
  cf_q15_resistance_pattern: string;
  cf_q16_work_curiosity: string;
  cf_q17_brand_authenticity: string;
}

export default function PillarAssessment({
  userEmail,
  onComplete,
  onBack,
  onSaveAndExit,
  onPillarTransition,
  resumePillar,
}: PillarAssessmentProps) {
  const [currentPillar, setCurrentPillar] = useState(1); // 1=Presence, 2=Digital, 3=Relationships, 4=Creative
  const [formData, setFormData] = useState<PillarData>({
    // PRESENCE
    p_q1_inner_voice: '',
    p_q2_evolution: '',
    p_q3_chaos_clarity: '',
    p_q4_follow_through: 0,
    p_q6_physical_presence: 0,
    p_q8_presence_quality: '',
    p_q9_energy_management: 0,
    p_q10_creation_mode: '',
    p_q11_consistency_volatility: '',

    // DIGITAL SELF
    ds_q1_file_organization: 0,
    ds_q2_problem_identification: '',
    ds_q3_ai_quality_control: 0,
    ds_q4_tool_selection: '',
    ds_q5_ai_explainability: '',
    ds_q6_ai_integration: '',
    ds_q7_technical_fluency: 0,
    ds_q8_system_resilience: '',
    ds_q8_5_automation: '',
    ds_q9_baseline_monitoring: '',
    ds_q10_brand_evolution: '',
    ds_q11_ai_power_dynamic: '',
    ds_q12_data_boundaries: [],
    ds_q12_follow_up: '',
    ds_q13_strength_alignment: '',
    ds_q15_past_wave: '',
    ds_q16_failure_recovery: '',
    ds_q17_content_leverage: '',

    // RELATIONSHIPS
    r_q2_emotional_awareness: '',
    r_q3_regulation_stress: '',
    r_q4_deep_work: 0,
    r_q5_communication_clarity: '',
    r_q6_conflict_pattern: '',
    r_q7_online_feedback: '',
    r_q8_mentor_presence: '',
    r_q9_boundaries: 0,
    r_q10_reciprocity: '',
    r_q11_energy_distribution: [],
    r_q12_network_elevation: '',
    r_q12_follow_up: '',
    r_q13_network_alignment: '',
    r_q14_resilience_flattery: '',
    r_q15_people_energy: '',
    r_q16_collaboration: '',
    r_q17_earning_relationship: '',
    r_q17_follow_up: 0,
    r_q18_sales_comfort: '',

    // CREATIVE FLOW
    cf_q1_natural_gifts: [],
    cf_q3_learning_appetite: '',
    cf_q4_creative_consistency: '',
    cf_q5_creation_source: '',
    cf_q6_artistic_maturity: '',
    cf_q7_creation_intent: '',
    cf_q8_ai_flow: 0,
    cf_q9_security_individuality: '',
    cf_q10_content_areas: [],
    cf_q11_perspective_flexibility: '',
    cf_q12_path_awareness: '',
    cf_q13_creative_fulfillment: '',
    cf_q14_creative_blocks: [],
    cf_q15_resistance_pattern: '',
    cf_q16_work_curiosity: '',
    cf_q17_brand_authenticity: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing progress
  useEffect(() => {
    loadProgress();
  }, [userEmail]);

  // Advance to a specific pillar when parent signals (used for inter-pillar transitions)
  useEffect(() => {
    if (resumePillar && resumePillar > 0) {
      setCurrentPillar(resumePillar);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [resumePillar]);

  const loadProgress = async () => {
    const progress = await loadPillarProgress(userEmail);
    if (progress && progress.data && Object.keys(progress.data).length > 0) {
      setFormData(prev => ({ ...prev, ...progress.data }));
      // Retake: already completed → start at Pillar 1 with answers prepopulated
      // Resume: not completed → jump to where they left off
      setCurrentPillar(progress.isComplete ? 1 : (progress.step > 0 ? progress.step : 1));
      console.log(`✅ Loaded pillar progress: Pillar ${progress.step}, complete: ${progress.isComplete}`);
    }
  };

  // Styles
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '"DM Mono", monospace',
    position: 'relative',
    overflow: 'hidden'
  };

  const grainStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.03,
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    zIndex: 1
  };

  const glowStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(68,170,255,0.15) 0%, rgba(68,255,136,0.1) 50%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 0,
    filter: 'blur(60px)'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 20px'
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden'
  };

  const gradientBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    padding: '3px',
    background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0a0a0a',
    marginBottom: '8px'
  };

  const radioLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: '#ffffff',
    color: '#0a0a0a'
  };

  const scaleContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px',
    marginTop: '8px'
  };

  const scaleButtonStyle = (value: number, selected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '16px 8px',
    fontSize: '18px',
    fontWeight: 600,
    border: '2px solid',
    borderColor: selected ? '#44AAFF' : '#e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    background: selected ? '#f0f9ff' : '#ffffff',
    color: '#0a0a0a',
    transition: 'all 0.2s',
    fontFamily: '"DM Mono", monospace'
  });

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginTop: '8px'
  };

  const checkboxLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: '#ffffff',
    color: '#0a0a0a'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: '"DM Mono", monospace',
    transition: 'all 0.2s',
    background: 'linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)',
    color: '#ffffff'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    border: '2px solid #e0e0e0',
    color: '#0a0a0a'
  };

  const saveExitButtonStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: '24px',
    right: '24px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 600,
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'transparent',
    color: '#0a0a0a',
    cursor: 'pointer',
    fontFamily: '"DM Mono", monospace',
    transition: 'all 0.2s',
    zIndex: 10
  };

  const errorStyle: React.CSSProperties = {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '4px'
  };
  const questionStyle: React.CSSProperties = {
    marginBottom: '32px'
  };

  const questionTextStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 600,
    color: '#0a0a0a',
    marginBottom: '16px',
    lineHeight: '1.5'
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  };

  const scaleLabelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '12px',
    color: '#666'
  };

  const checkboxGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    marginTop: '16px'
  };

  const radioLabelSelectedStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '2px solid #44AAFF',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: '#f0f9ff',
    color: '#0a0a0a'
  };

  const checkboxLabelSelectedStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '2px solid #44AAFF',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    background: '#f0f9ff',
    color: '#0a0a0a'
  };

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (currentPillar === 1) {
    if (!formData.p_q1_inner_voice) newErrors.p_q1 = 'Required';
    if (!formData.p_q2_evolution) newErrors.p_q2 = 'Required';
    if (!formData.p_q3_chaos_clarity) newErrors.p_q3 = 'Required';
    if (formData.p_q4_follow_through === 0) newErrors.p_q4 = 'Required';
    if (formData.p_q6_physical_presence === 0) newErrors.p_q6 = 'Required';
    if (!formData.p_q8_presence_quality) newErrors.p_q8 = 'Required';
    if (formData.p_q9_energy_management === 0) newErrors.p_q9 = 'Required';
    if (!formData.p_q10_creation_mode) newErrors.p_q10 = 'Required';
    if (!formData.p_q11_consistency_volatility) newErrors.p_q11 = 'Required';
  }

  if (currentPillar === 2) {
    if (formData.ds_q1_file_organization === 0) newErrors.ds_q1 = 'Required';
    if (!formData.ds_q2_problem_identification) newErrors.ds_q2 = 'Required';
    if (formData.ds_q3_ai_quality_control === 0) newErrors.ds_q3 = 'Required';
    if (!formData.ds_q4_tool_selection) newErrors.ds_q4 = 'Required';
    if (!formData.ds_q5_ai_explainability) newErrors.ds_q5 = 'Required';
    if (!formData.ds_q6_ai_integration) newErrors.ds_q6 = 'Required';
    if (formData.ds_q7_technical_fluency === 0) newErrors.ds_q7 = 'Required';
    if (!formData.ds_q8_system_resilience) newErrors.ds_q8 = 'Required';
    if (!formData.ds_q8_5_automation) newErrors.ds_q8_5 = 'Required';
    if (!formData.ds_q9_baseline_monitoring) newErrors.ds_q9 = 'Required';
    if (!formData.ds_q10_brand_evolution) newErrors.ds_q10 = 'Required';
    if (!formData.ds_q11_ai_power_dynamic) newErrors.ds_q11 = 'Required';
    if (formData.ds_q12_data_boundaries.length === 0) newErrors.ds_q12 = 'Select at least one';
    if (!formData.ds_q12_follow_up) newErrors.ds_q12_follow = 'Required';
    if (!formData.ds_q13_strength_alignment) newErrors.ds_q13 = 'Required';
    if (!formData.ds_q15_past_wave) newErrors.ds_q15 = 'Required';
    if (!formData.ds_q16_failure_recovery) newErrors.ds_q16 = 'Required';
    if (!formData.ds_q17_content_leverage) newErrors.ds_q17 = 'Required';
  }

  if (currentPillar === 3) {
    if (!formData.r_q2_emotional_awareness) newErrors.r_q2 = 'Required';
    if (!formData.r_q3_regulation_stress) newErrors.r_q3 = 'Required';
    if (formData.r_q4_deep_work === 0) newErrors.r_q4 = 'Required';
    if (!formData.r_q5_communication_clarity) newErrors.r_q5 = 'Required';
    if (!formData.r_q6_conflict_pattern) newErrors.r_q6 = 'Required';
    if (!formData.r_q7_online_feedback) newErrors.r_q7 = 'Required';
    if (!formData.r_q8_mentor_presence) newErrors.r_q8 = 'Required';
    if (formData.r_q9_boundaries === 0) newErrors.r_q9 = 'Required';
    if (!formData.r_q10_reciprocity) newErrors.r_q10 = 'Required';
    if (formData.r_q11_energy_distribution.length === 0) newErrors.r_q11 = 'Select at least one';
    if (!formData.r_q12_network_elevation) newErrors.r_q12 = 'Required';
    if (!formData.r_q13_network_alignment) newErrors.r_q13 = 'Required';
    if (!formData.r_q14_resilience_flattery) newErrors.r_q14 = 'Required';
    if (!formData.r_q15_people_energy) newErrors.r_q15 = 'Required';
    if (!formData.r_q16_collaboration) newErrors.r_q16 = 'Required';
    if (!formData.r_q17_earning_relationship) newErrors.r_q17 = 'Required';
    if (formData.r_q17_follow_up === 0) newErrors.r_q17_follow = 'Required';
    if (!formData.r_q18_sales_comfort) newErrors.r_q18 = 'Required';
  }

  if (currentPillar === 4) {
    if (formData.cf_q1_natural_gifts.length === 0) newErrors.cf_q1 = 'Select at least one';
    if (!formData.cf_q3_learning_appetite) newErrors.cf_q3 = 'Required';
    if (!formData.cf_q4_creative_consistency) newErrors.cf_q4 = 'Required';
    if (!formData.cf_q5_creation_source) newErrors.cf_q5 = 'Required';
    if (!formData.cf_q6_artistic_maturity) newErrors.cf_q6 = 'Required';
    if (!formData.cf_q7_creation_intent) newErrors.cf_q7 = 'Required';
    if (formData.cf_q8_ai_flow === 0) newErrors.cf_q8 = 'Required';
    if (!formData.cf_q9_security_individuality) newErrors.cf_q9 = 'Required';
    if (formData.cf_q10_content_areas.length === 0) newErrors.cf_q10 = 'Select at least one';
    if (!formData.cf_q11_perspective_flexibility) newErrors.cf_q11 = 'Required';
    if (!formData.cf_q12_path_awareness) newErrors.cf_q12 = 'Required';
    if (!formData.cf_q13_creative_fulfillment) newErrors.cf_q13 = 'Required';
    if (formData.cf_q14_creative_blocks.length === 0) newErrors.cf_q14 = 'Select at least one';
    if (!formData.cf_q15_resistance_pattern) newErrors.cf_q15 = 'Required';
    if (!formData.cf_q16_work_curiosity) newErrors.cf_q16 = 'Required';
    if (!formData.cf_q17_brand_authenticity) newErrors.cf_q17 = 'Required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  const handleNext = async () => {
    if (!validate()) return;

    // Auto-save progress
    const saved = await savePillarProgress(
      userEmail,
      currentPillar,
      formData,
      false
    );

    if (!saved) {
      console.error('Failed to auto-save progress');
    }

    if (currentPillar < 4) {
      if (onPillarTransition) {
        onPillarTransition(currentPillar + 1);
      } else {
        setCurrentPillar(currentPillar + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentPillar > 1) {
      setCurrentPillar(currentPillar - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const saved = await savePillarProgress(
        userEmail,
        4,
        formData,
        true
      );

      if (!saved) {
        throw new Error('Failed to save pillar assessment');
      }

      onComplete(formData);
    } catch (error) {
      console.error('Error submitting pillar assessment:', error);
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (field: keyof PillarData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    setFormData({ ...formData, [field]: newArray });
  };

  const getPillarTitle = () => {
    switch (currentPillar) {
      case 1: return 'Pillar 1: Presence';
      case 2: return 'Pillar 2: Digital Self';
      case 3: return 'Pillar 3: Relationships';
      case 4: return 'Pillar 4: Creative Flow';
      default: return 'Assessment';
    }
  };

  const getPillarDescription = () => {
    switch (currentPillar) {
      case 1: return 'Sovereignty, groundedness, intentionality vs reactive survival mode';
      case 2: return 'Technology mastery + authentic voice + systems aligned with strengths';
      case 3: return 'Self-relationship foundation, communication maturity, network quality';
      case 4: return 'Creative process, energy, and sustainable output';
      default: return '';
    }
  };

  return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      
      <div style={contentStyle}>
        <div style={cardStyle}>
          <div style={gradientBorderStyle} />
          
          {/* Save & Exit Button */}
          <button
            onClick={async () => {
              await savePillarProgress(userEmail, currentPillar, formData, false);
              onSaveAndExit();
            }}
            style={saveExitButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#44AAFF';
              e.currentTarget.style.color = '#44AAFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.color = '#0a0a0a';
            }}
          >
            Save & Return to Home
          </button>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '12px',
              color: '#0a0a0a',
              lineHeight: 1.2
            }}>
              {getPillarTitle()}
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              {getPillarDescription()}
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
                width: `${(currentPillar / 4) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* PILLAR 1: PRESENCE (9 Questions) */}
          {currentPillar === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* P Q1: Inner Voice Quality */}
              <div>
                <label style={labelStyle}>
                  The voice in my head sounds like…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) A harsh critic — never good enough' },
                    { value: 'B', label: 'B) Mixed — sometimes supportive, often critical' },
                    { value: 'C', label: 'C) Mostly encouraging with occasional tough love' },
                    { value: 'D', label: 'D) A wise, compassionate ally' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q1_inner_voice === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q1_inner_voice === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q1_inner_voice"
                        value={option.value}
                        checked={formData.p_q1_inner_voice === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q1_inner_voice: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q1 && <div style={errorStyle}>{errors.p_q1}</div>}
              </div>

              {/* P Q2: Evolution of Voice + Beliefs */}
              <div>
                <label style={labelStyle}>
                  How my opinions and truth evolve over time…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) I stay consistent — changing feels like weakness' },
                    { value: 'B', label: 'B) They shift but I don\'t talk about it publicly' },
                    { value: 'C', label: 'C) I share my evolution intentionally and transparently' },
                    { value: 'D', label: 'D) My audience notices the shifts (sometimes they call me out)' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q2_evolution === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q2_evolution === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q2_evolution"
                        value={option.value}
                        checked={formData.p_q2_evolution === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q2_evolution: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q2 && <div style={errorStyle}>{errors.p_q2}</div>}
              </div>

              {/* P Q3: Chaos vs Clarity */}
              <div>
                <label style={labelStyle}>
                  When things are unclear, I tend to…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) Spin in circles, feel paralyzed' },
                    { value: 'B', label: 'B) Play with options endlessly but stall on decisions' },
                    { value: 'C', label: 'C) Choose a direction, act, and refine as I go' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q3_chaos_clarity === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q3_chaos_clarity === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q3_chaos_clarity"
                        value={option.value}
                        checked={formData.p_q3_chaos_clarity === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q3_chaos_clarity: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q3 && <div style={errorStyle}>{errors.p_q3}</div>}
              </div>

              {/* P Q4: Follow-Through (1-5 scale) */}
              <div>
                <label style={labelStyle}>
                  My consistency in finishing what I start…
                </label>
                <div style={scaleContainerStyle}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, p_q4_follow_through: value })}
                      style={scaleButtonStyle(value, formData.p_q4_follow_through === value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#999' }}>
                  <span>I spark on ideas then drop them (repeat cycle)</span>
                  <span>I close loops even when it's messy</span>
                </div>
                {errors.p_q4 && <div style={errorStyle}>{errors.p_q4}</div>}
              </div>

              {/* P Q6: Physical Presence (1-5 scale) */}
              <div>
                <label style={labelStyle}>
                  My physical energy and health directly impact my ability to sustain creative/business work over time…
                </label>
                <div style={scaleContainerStyle}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, p_q6_physical_presence: value })}
                      style={scaleButtonStyle(value, formData.p_q6_physical_presence === value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#999' }}>
                  <span>Severely — when my body's off, everything collapses</span>
                  <span>Minimally — I've built systems to work regardless</span>
                </div>
                {errors.p_q6 && <div style={errorStyle}>{errors.p_q6}</div>}
              </div>

              {/* P Q8: Presence Quality */}
              <div>
                <label style={labelStyle}>
                  When I show up to work or create, my attention is…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) Scattered across multiple tabs/thoughts' },
                    { value: 'B', label: 'B) Half-there (multitasking, partially distracted)' },
                    { value: 'C', label: 'C) Mostly present' },
                    { value: 'D', label: 'D) ALL there — undivided focus' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q8_presence_quality === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q8_presence_quality === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q8_presence_quality"
                        value={option.value}
                        checked={formData.p_q8_presence_quality === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q8_presence_quality: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q8 && <div style={errorStyle}>{errors.p_q8}</div>}
              </div>

              {/* P Q9: Energy Management (1-5 scale) */}
              <div>
                <label style={labelStyle}>
                  I structure my work around my energy patterns…
                </label>
                <div style={scaleContainerStyle}>
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      onClick={() => setFormData({ ...formData, p_q9_energy_management: value })}
                      style={scaleButtonStyle(value, formData.p_q9_energy_management === value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px', color: '#999' }}>
                  <span>No awareness — I just push through everything</span>
                  <span>Ruthlessly optimize my day for peak energy states</span>
                </div>
                {errors.p_q9 && <div style={errorStyle}>{errors.p_q9}</div>}
              </div>

              {/* P Q10: Creation Mode */}
              <div>
                <label style={labelStyle}>
                  I create because…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) I need validation or money (external pressure)' },
                    { value: 'B', label: 'B) I feel obligated or "should" be creating' },
                    { value: 'C', label: 'C) I\'m genuinely inspired (intrinsic motivation)' },
                    { value: 'D', label: 'D) It\'s who I am (non-negotiable creative identity)' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q10_creation_mode === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q10_creation_mode === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q10_creation_mode"
                        value={option.value}
                        checked={formData.p_q10_creation_mode === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q10_creation_mode: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q10 && <div style={errorStyle}>{errors.p_q10}</div>}
              </div>

              {/* P Q11: Consistency Across Volatility */}
              <div>
                <label style={labelStyle}>
                  When life gets chaotic (health, family, unexpected crisis)…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'A', label: 'A) Everything falls apart — I can\'t maintain anything' },
                    { value: 'B', label: 'B) I survive but work quality/consistency drops significantly' },
                    { value: 'C', label: 'C) I adjust expectations but keep core things going' },
                    { value: 'D', label: 'D) I have systems that hold even when I\'m not at 100%' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        ...radioLabelStyle,
                        borderColor: formData.p_q11_consistency_volatility === option.value ? '#44AAFF' : '#e0e0e0',
                        background: formData.p_q11_consistency_volatility === option.value ? '#f0f9ff' : '#ffffff'
                      }}
                    >
                      <input
                        type="radio"
                        name="p_q11_consistency_volatility"
                        value={option.value}
                        checked={formData.p_q11_consistency_volatility === option.value}
                        onChange={(e) => setFormData({ ...formData, p_q11_consistency_volatility: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.p_q11 && <div style={errorStyle}>{errors.p_q11}</div>}
              </div>
            </div>
          )}

{/* PILLAR 2: DIGITAL SELF (17 questions) */}
{currentPillar === 2 && (
  <div>
    {/* DS Q1: File Organization */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My files/data are organized…
      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, ds_q1_file_organization: num })}
            style={scaleButtonStyle(num, formData.ds_q1_file_organization === num)}
            onMouseEnter={(e) => {
              if (formData.ds_q1_file_organization !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q1_file_organization !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Total chaos — waste hours searching</span>
        <span>Clean, documented, anyone could navigate</span>
      </div>
    </div>

    {/* DS Q2: Problem Identification */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to identifying which work is valuable vs busywork…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q2_problem_identification === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q2_problem_identification !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q2_problem_identification !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q2"
              value={option}
              checked={formData.ds_q2_problem_identification === option}
              onChange={(e) => setFormData({ ...formData, ds_q2_problem_identification: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Everything feels urgent — no clear distinction"}
              {option === 'B' && "I have hunches but haven't mapped it out"}
              {option === 'C' && "I can clearly separate high-value from low-value tasks"}
              {option === 'D' && "I've documented what's strategic vs what should be automated"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q3: AI Quality Control */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "I can call BS on AI output and know when it's wrong…"      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, ds_q3_ai_quality_control: num })}
            style={scaleButtonStyle(num, formData.ds_q3_ai_quality_control === num)}
            onMouseEnter={(e) => {
              if (formData.ds_q3_ai_quality_control !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q3_ai_quality_control !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>No, I trust it blindly</span>
        <span>Yes, I validate everything critically</span>
      </div>
    </div>

    {/* DS Q4: Tool Selection */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When choosing new tools…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q4_tool_selection === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q4_tool_selection !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q4_tool_selection !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q4"
              value={option}
              checked={formData.ds_q4_tool_selection === option}
              onChange={(e) => setFormData({ ...formData, ds_q4_tool_selection: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "FOMO — I download everything trending"}
              {option === 'B' && "I try things then forget about them"}
              {option === 'C' && "I evaluate based on specific needs"}
              {option === 'D' && "I test, document efficacy, then integrate systematically"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q5: AI Explainability */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When AI gives me output, I…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q5_ai_explainability === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q5_ai_explainability !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q5_ai_explainability !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q5"
              value={option}
              checked={formData.ds_q5_ai_explainability === option}
              onChange={(e) => setFormData({ ...formData, ds_q5_ai_explainability: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Use it as-is without checking quality"}
              {option === 'B' && "Spot-check but don't understand why it worked/didn't"}
              {option === 'C' && "Can explain what made it good or bad"}
              {option === 'D' && "Refine systematically and document what works"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q6: AI Integration */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        How many projects or workflows are you actively using AI in right now?
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q6_ai_integration === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q6_ai_integration !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q6_ai_integration !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q6"
              value={option}
              checked={formData.ds_q6_ai_integration === option}
              onChange={(e) => setFormData({ ...formData, ds_q6_ai_integration: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "None"}
              {option === 'B' && "1-2"}
              {option === 'C' && "3-5"}
              {option === 'D' && "6+"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q7: Technical Fluency */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        I understand these AI/tech concepts without Googling: MCP servers, artifacts, function calling, context windows, system prompts.
      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, ds_q7_technical_fluency: num })}
            style={scaleButtonStyle(num, formData.ds_q7_technical_fluency === num)}
            onMouseEnter={(e) => {
              if (formData.ds_q7_technical_fluency !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q7_technical_fluency !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>What language is this?</span>
        <span>Yes, I could teach someone</span>
      </div>
    </div>

    {/* DS Q8: System Resilience */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        If I disappeared for a month, my digital systems would…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q8_system_resilience === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q8_system_resilience !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q8_system_resilience !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q8"
              value={option}
              checked={formData.ds_q8_system_resilience === option}
              onChange={(e) => setFormData({ ...formData, ds_q8_system_resilience: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Collapse immediately — I am the system"}
              {option === 'B' && "Survive a week, then chaos"}
              {option === 'C' && "Run with someone managing it"}
              {option === 'D' && "Continue autonomously (documented, automated)"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q8.5: Automation */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My current level of automation is…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q8_5_automation === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q8_5_automation !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q8_5_automation !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q8_5"
              value={option}
              checked={formData.ds_q8_5_automation === option}
              onChange={(e) => setFormData({ ...formData, ds_q8_5_automation: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Manual everything — I am the system"}
              {option === 'B' && "Basic automations (Zapier, IFTTT one-offs)"}
              {option === 'C' && "Integrated workflows (multi-step sequences)"}
              {option === 'D' && "Autonomous systems (AI agents handling complex tasks)"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q9: Baseline Monitoring */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        I know if my business/content is improving because…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q9_baseline_monitoring === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q9_baseline_monitoring !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q9_baseline_monitoring !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q9"
              value={option}
              checked={formData.ds_q9_baseline_monitoring === option}
              onChange={(e) => setFormData({ ...formData, ds_q9_baseline_monitoring: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I have no idea — just vibes"}
              {option === 'B' && "I check numbers occasionally but don't track trends"}
              {option === 'C' && "I track key metrics monthly and notice patterns"}
              {option === 'D' && "I have dashboards and review systems that flag changes"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q10: Brand Evolution */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My public brand/messaging over time has…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q10_brand_evolution === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q10_brand_evolution !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q10_brand_evolution !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q10"
              value={option}
              checked={formData.ds_q10_brand_evolution === option}
              onChange={(e) => setFormData({ ...formData, ds_q10_brand_evolution: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Stayed exactly the same (afraid to change)"}
              {option === 'B' && "Drifted without intention (confusing to audience)"}
              {option === 'C' && "Evolved intentionally (I document pivots publicly)"}
              {option === 'D' && "Matured alongside me (audience grows with me)"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q11: AI Power Dynamic */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When I use AI, the dynamic is…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q11_ai_power_dynamic === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q11_ai_power_dynamic !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q11_ai_power_dynamic !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q11"
              value={option}
              checked={formData.ds_q11_ai_power_dynamic === option}
              onChange={(e) => setFormData({ ...formData, ds_q11_ai_power_dynamic: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I let it lead, I follow"}
              {option === 'B' && "We co-pilot, it often sets direction"}
              {option === 'C' && "I steer, it extends my thinking"}
              {option === 'D' && "I architect the entire interaction"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q12: Data Boundaries */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "I've fed AI tools information about… (select all that apply)"      </div>
      <div style={checkboxGroupStyle}>
        {[
          "Personal photos",
          "Medical information",
          "Legal documents",
          "Banking/tax information",
          "Relationship/therapy conversations",
          "None of the above"
        ].map((option) => (
          <label
            key={option}
            style={(formData.ds_q12_data_boundaries || []).includes(option) ? checkboxLabelSelectedStyle : checkboxLabelStyle}
            onMouseEnter={(e) => {
              if (!(formData.ds_q12_data_boundaries || []).includes(option)) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!(formData.ds_q12_data_boundaries || []).includes(option)) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="checkbox"
              checked={(formData.ds_q12_data_boundaries || []).includes(option)}
              onChange={() => handleCheckboxChange('ds_q12_data_boundaries', option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q12 Follow-up */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "How do you feel about what you've shared?"      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q12_follow_up === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q12_follow_up !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q12_follow_up !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q12_follow"
              value={option}
              checked={formData.ds_q12_follow_up === option}
              onChange={(e) => setFormData({ ...formData, ds_q12_follow_up: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Didn't think about it until now (uh oh)"}
              {option === 'B' && "A little uneasy but it was convenient"}
              {option === 'C' && "Comfortable — I trust the tools I use"}
              {option === 'D' && "Intentional — I know the risks and made informed choices"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q13: Strength Alignment */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My systems and processes…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q13_strength_alignment === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q13_strength_alignment !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q13_strength_alignment !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q13"
              value={option}
              checked={formData.ds_q13_strength_alignment === option}
              onChange={(e) => setFormData({ ...formData, ds_q13_strength_alignment: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Don't exist — I just hustle"}
              {option === 'B' && "Copied from others (doesn't fit my style)"}
              {option === 'C' && "Support my natural working style"}
              {option === 'D' && "Amplify my strengths and compensate for weaknesses"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q15: Past Wave */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When a new wave hits (apps, AI, trends)…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C'].map((option) => (
          <label
            key={option}
            style={formData.ds_q15_past_wave === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q15_past_wave !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q15_past_wave !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q15"
              value={option}
              checked={formData.ds_q15_past_wave === option}
              onChange={(e) => setFormData({ ...formData, ds_q15_past_wave: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I experiment quietly, mostly for myself"}
              {option === 'B' && "I test on myself, then share casually with friends"}
              {option === 'C' && "I dive in as a translator/advocate, helping others adopt it too"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q16: Failure Recovery */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "When something I build/launch doesn't work…"      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q16_failure_recovery === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q16_failure_recovery !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q16_failure_recovery !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q16"
              value={option}
              checked={formData.ds_q16_failure_recovery === option}
              onChange={(e) => setFormData({ ...formData, ds_q16_failure_recovery: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I take it personally and quit"}
              {option === 'B' && "I abandon it and try something completely new"}
              {option === 'C' && "I analyze what went wrong and iterate"}
              {option === 'D' && "I treat it as data and rapidly test variations"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* DS Q17: Content Leverage */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        After I create something (post, video, article)…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.ds_q17_content_leverage === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.ds_q17_content_leverage !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.ds_q17_content_leverage !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="ds_q17"
              value={option}
              checked={formData.ds_q17_content_leverage === option}
              onChange={(e) => setFormData({ ...formData, ds_q17_content_leverage: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I move on immediately to the next thing"}
              {option === 'B' && "I occasionally share it again"}
              {option === 'C' && "I repurpose it across 2-3 formats/platforms"}
              {option === 'D' && "I have a system to multiply its reach (atomize, remix, distribute)"}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
)}

{/* PILLAR 3: RELATIONSHIPS (18 questions) */}
{currentPillar === 3 && (
  <div>
    {/* R Q2: Emotional Awareness */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When making business or creative decisions, my emotions…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q2_emotional_awareness === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q2_emotional_awareness !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q2_emotional_awareness !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q2"
              value={option}
              checked={formData.r_q2_emotional_awareness === option}
              onChange={(e) => setFormData({ ...formData, r_q2_emotional_awareness: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Hijack me — I decide reactively and regret it"}
              {option === 'B' && "Confuse me — I can't separate feelings from logic"}
              {option === 'C' && "Inform me — I use them as data alongside strategy"}
              {option === 'D' && "Guide me — emotional + strategic alignment creates best outcomes"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q3: Regulation Stress */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "When I'm triggered or overwhelmed…"      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q3_regulation_stress === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q3_regulation_stress !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q3_regulation_stress !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q3"
              value={option}
              checked={formData.r_q3_regulation_stress === option}
              onChange={(e) => setFormData({ ...formData, r_q3_regulation_stress: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I spiral and stay reactive for hours/days"}
              {option === 'B' && "I eventually calm down but it takes a while"}
              {option === 'C' && "I can usually regulate within an hour"}
              {option === 'D' && "I catch it early and shift quickly"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q4: Deep Work */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My ability to do focused, solo deep work is…
      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, r_q4_deep_work: num })}
            style={scaleButtonStyle(num, formData.r_q4_deep_work === num)}
            onMouseEnter={(e) => {
              if (formData.r_q4_deep_work !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q4_deep_work !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Nearly impossible — need constant stimulation</span>
        <span>This is where my best work happens</span>
      </div>
    </div>

    {/* R Q5: Communication Clarity */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When communicating my offer/value to my audience…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q5_communication_clarity === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q5_communication_clarity !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q5_communication_clarity !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q5"
              value={option}
              checked={formData.r_q5_communication_clarity === option}
              onChange={(e) => setFormData({ ...formData, r_q5_communication_clarity: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I'm vague and hope they figure it out"}
              {option === 'B' && "I overexplain and confuse people"}
              {option === 'C' && "I'm clear and direct about what I do"}
              {option === 'D' && "I'm compelling — people understand AND want it immediately"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q6: Conflict Pattern */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When conflict arises (work, relationships, online), I tend to…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q6_conflict_pattern === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q6_conflict_pattern !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q6_conflict_pattern !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q6"
              value={option}
              checked={formData.r_q6_conflict_pattern === option}
              onChange={(e) => setFormData({ ...formData, r_q6_conflict_pattern: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Avoid it entirely (ghosting is easier)"}
              {option === 'B' && "React defensively or escalate"}
              {option === 'C' && "Pause, regulate, then engage"}
              {option === 'D' && "Approach it as information, not threat"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q7: Online Feedback */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When people critique or disagree with me in online spaces (comments, replies, forums)…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q7_online_feedback === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q7_online_feedback !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q7_online_feedback !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q7"
              value={option}
              checked={formData.r_q7_online_feedback === option}
              onChange={(e) => setFormData({ ...formData, r_q7_online_feedback: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I take it personally and either delete/block or spiral"}
              {option === 'B' && "I get defensive and argue back"}
              {option === 'C' && "I pause, consider if there's truth, then respond or ignore"}
              {option === 'D' && "I engage curiously — disagreement is just data"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q8: Mentor Presence */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to seeking guidance and mentorship…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q8_mentor_presence === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q8_mentor_presence !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q8_mentor_presence !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q8"
              value={option}
              checked={formData.r_q8_mentor_presence === option}
              onChange={(e) => setFormData({ ...formData, r_q8_mentor_presence: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I don't seek it — I figure things out alone"}
              {option === 'B' && "I wait for mentors to find me"}
              {option === 'C' && "I actively seek guidance but struggle to find the right people"}
              {option === 'D' && "I have a clear mentor network and leverage it intentionally"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q9: Boundaries */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to saying no and protecting my energy…
      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, r_q9_boundaries: num })}
            style={scaleButtonStyle(num, formData.r_q9_boundaries === num)}
            onMouseEnter={(e) => {
              if (formData.r_q9_boundaries !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q9_boundaries !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>I say yes to everything (people-pleaser)</span>
        <span>I ruthlessly protect my time and energy</span>
      </div>
    </div>

    {/* R Q10: Reciprocity */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        In my professional collaborations and partnerships…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q10_reciprocity === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q10_reciprocity !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q10_reciprocity !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q10"
              value={option}
              checked={formData.r_q10_reciprocity === option}
              onChange={(e) => setFormData({ ...formData, r_q10_reciprocity: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I'm taken advantage of repeatedly"}
              {option === 'B' && "Unbalanced but I tolerate it for opportunities"}
              {option === 'C' && "Mostly fair exchanges"}
              {option === 'D' && "Win-win-win — we all grow together"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q11: Energy Distribution */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        Rank where your relationship energy goes (select all that apply):
      </div>
      <div style={checkboxGroupStyle}>
        {[
          "Family (obligation, history, complexity)",
          "Personal/Social (friends, community)",
          "Professional (colleagues, clients, collaborators)",
          "Online/Digital (audience, followers, internet friends)"
        ].map((option) => (
          <label
            key={option}
            style={(formData.r_q11_energy_distribution || []).includes(option) ? checkboxLabelSelectedStyle : checkboxLabelStyle}
            onMouseEnter={(e) => {
              if (!(formData.r_q11_energy_distribution || []).includes(option)) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!(formData.r_q11_energy_distribution || []).includes(option)) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="checkbox"
              checked={(formData.r_q11_energy_distribution || []).includes(option)}
              onChange={() => handleCheckboxChange('r_q11_energy_distribution', option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q12: Network Elevation */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        The people in my life…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q12_network_elevation === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q12_network_elevation !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q12_network_elevation !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q12"
              value={option}
              checked={formData.r_q12_network_elevation === option}
              onChange={(e) => setFormData({ ...formData, r_q12_network_elevation: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Keep me comfortable but don't challenge me"}
              {option === 'B' && "Are at my level — we plateau together"}
              {option === 'C' && "Some elevate me, some don't"}
              {option === 'D' && "Actively challenge and grow me"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q12 Follow-up */}
    {(formData.r_q12_network_elevation === 'A' || formData.r_q12_network_elevation === 'B') && (
      <div style={questionStyle}>
        <div style={questionTextStyle}>
          If you're surrounded by people who don't challenge you, why do you think that is?
        </div>
        <div style={radioGroupStyle}>
          {['A', 'B', 'C', 'D', 'E'].map((option) => (
            <label
              key={option}
              style={formData.r_q12_follow_up === option ? radioLabelSelectedStyle : radioLabelStyle}
              onMouseEnter={(e) => {
                if (formData.r_q12_follow_up !== option) {
                  e.currentTarget.style.borderColor = '#44AAFF';
                }
              }}
              onMouseLeave={(e) => {
                if (formData.r_q12_follow_up !== option) {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }
              }}
            >
              <input
                type="radio"
                name="r_q12_follow"
                value={option}
                checked={formData.r_q12_follow_up === option}
                onChange={(e) => setFormData({ ...formData, r_q12_follow_up: e.target.value })}
                style={{ marginTop: '2px' }}
              />
              <span>
                {option === 'A' && "Fear of being left behind if I level up"}
                {option === 'B' && "Comfort — it's easier to stay small"}
                {option === 'C' && "Loyalty — I don't want to outgrow people"}
                {option === 'D' && "Scarcity — I don't know how to find elevating relationships"}
                {option === 'E' && "Not applicable — my people challenge me"}
              </span>
            </label>
          ))}
        </div>
      </div>
    )}

    {/* R Q13: Network Alignment */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My current network/connections are…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q13_network_alignment === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q13_network_alignment !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q13_network_alignment !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q13"
              value={option}
              checked={formData.r_q13_network_alignment === option}
              onChange={(e) => setFormData({ ...formData, r_q13_network_alignment: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Random — whoever I've met along the way"}
              {option === 'B' && "Loosely aligned with my goals"}
              {option === 'C' && "Mostly strategic and supportive"}
              {option === 'D' && "Deliberately curated to amplify my path"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q14: Resilience Flattery */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When AI mirrors your ideas back (sometimes flattering, sometimes shallow), what do you do?
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C'].map((option) => (
          <label
            key={option}
            style={formData.r_q14_resilience_flattery === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q14_resilience_flattery !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q14_resilience_flattery !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q14"
              value={option}
              checked={formData.r_q14_resilience_flattery === option}
              onChange={(e) => setFormData({ ...formData, r_q14_resilience_flattery: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Nodding along feels nice, I keep it"}
              {option === 'B' && "I use parts of it, even if shallow, to save time"}
              {option === 'C' && "I push it deeper, question it, and make sure the substance is mine"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q15: People Energy */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        After spending time with most people in my life, I feel…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q15_people_energy === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q15_people_energy !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q15_people_energy !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q15"
              value={option}
              checked={formData.r_q15_people_energy === option}
              onChange={(e) => setFormData({ ...formData, r_q15_people_energy: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Drained — people are exhausting"}
              {option === 'B' && "Neutral — it depends heavily on the person"}
              {option === 'C' && "Energized by most, drained by a few"}
              {option === 'D' && "Energized — I've curated my circle intentionally"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q16: Collaboration */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to collaboration, I…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q16_collaboration === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q16_collaboration !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q16_collaboration !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q16"
              value={option}
              checked={formData.r_q16_collaboration === option}
              onChange={(e) => setFormData({ ...formData, r_q16_collaboration: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Prefer solo — less drama"}
              {option === 'B' && "Collaborate when necessary"}
              {option === 'C' && "Actively seek co-creation opportunities"}
              {option === 'D' && "Thrive in collaborative environments"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q17: Earning Relationship */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to making money for myself (not a salary from someone else)…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q17_earning_relationship === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q17_earning_relationship !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q17_earning_relationship !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q17"
              value={option}
              checked={formData.r_q17_earning_relationship === option}
              onChange={(e) => setFormData({ ...formData, r_q17_earning_relationship: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Terrifying — I don't know how to get it"}
              {option === 'B' && "Uncertain — I have skills but struggle to position/sell them"}
              {option === 'C' && "Capable — I can generate income but inconsistently"}
              {option === 'D' && "Confident — I know how to create and capture value"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* R Q17 Follow-up */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My current ability to go get money with my skills and positioning is…
      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, r_q17_follow_up: num })}
            style={scaleButtonStyle(num, formData.r_q17_follow_up === num)}
            onMouseEnter={(e) => {
              if (formData.r_q17_follow_up !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q17_follow_up !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Non-existent (rely on employment only)</span>
        <span>Strong — can generate income on my terms</span>
      </div>
    </div>

    {/* R Q18: Sales Comfort */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to asking people to buy from me…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.r_q18_sales_comfort === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.r_q18_sales_comfort !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.r_q18_sales_comfort !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="r_q18"
              value={option}
              checked={formData.r_q18_sales_comfort === option}
              onChange={(e) => setFormData({ ...formData, r_q18_sales_comfort: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I feel gross and avoid it (imposter syndrome)"}
              {option === 'B' && "I do it but apologetically (\"sorry to bother you\")"}
              {option === 'C' && "I'm direct but still a bit uncomfortable"}
              {option === 'D' && "I'm confident — what I offer is valuable and I own it"}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
)}

{/* PILLAR 4: CREATIVE FLOW (16 questions) */}
{currentPillar === 4 && (
  <div>
    {/* CF Q1: Natural Gifts */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        The creative work that feels most natural to me is… (select top 3)
      </div>
      <div style={checkboxGroupStyle}>
        {[
          "Writing / storytelling",
          "Visual design / art",
          "Strategy / systems thinking",
          "Teaching / translating ideas",
          "Performance / presenting",
          "Building / making things",
          "Connecting people / curating",
          "Data / analysis / patterns",
          "Movement / embodiment",
          "Music / sound"
        ].map((option) => (
          <label
            key={option}
            style={(formData.cf_q1_natural_gifts || []).includes(option) ? checkboxLabelSelectedStyle : checkboxLabelStyle}
            onMouseEnter={(e) => {
              if (!(formData.cf_q1_natural_gifts || []).includes(option)) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!(formData.cf_q1_natural_gifts || []).includes(option)) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="checkbox"
              checked={(formData.cf_q1_natural_gifts || []).includes(option)}
              onChange={() => handleCheckboxChange('cf_q1_natural_gifts', option)}
              disabled={!(formData.cf_q1_natural_gifts || []).includes(option) && (formData.cf_q1_natural_gifts || []).length >= 3}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
        Select up to 3 options ({(formData.cf_q1_natural_gifts || []).length}/3 selected)
      </div>
    </div>

    {/* CF Q3: Learning Appetite */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When I discover something new and interesting…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q3_learning_appetite === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q3_learning_appetite !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q3_learning_appetite !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q3"
              value={option}
              checked={formData.cf_q3_learning_appetite === option}
              onChange={(e) => setFormData({ ...formData, cf_q3_learning_appetite: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I consume passively and move on"}
              {option === 'B' && "I save it for later (then forget about it)"}
              {option === 'C' && "I experiment with it personally"}
              {option === 'D' && "I integrate it into my work or teach it to others"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q4: Creative Consistency */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My creative practice looks like…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q4_creative_consistency === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q4_creative_consistency !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q4_creative_consistency !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q4"
              value={option}
              checked={formData.cf_q4_creative_consistency === option}
              onChange={(e) => setFormData({ ...formData, cf_q4_creative_consistency: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Sporadic — I create when inspiration strikes"}
              {option === 'B' && "Inconsistent — I try but life gets in the way"}
              {option === 'C' && "Regular rhythm — I protect creative time"}
              {option === 'D' && "Daily discipline — creation is non-negotiable"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q5: Creation Source */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        Most of my work is created from…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q5_creation_source === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q5_creation_source !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q5_creation_source !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q5"
              value={option}
              checked={formData.cf_q5_creation_source === option}
              onChange={(e) => setFormData({ ...formData, cf_q5_creation_source: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Reaction — responding to trends, algorithms, what's working"}
              {option === 'B' && "Imitation — studying and adapting others' playbooks"}
              {option === 'C' && "Translation — interpreting existing ideas through my lens"}
              {option === 'D' && "Origination — pulling from my unique experiences and insights"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q6: Artistic Maturity */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When it comes to sharing my creative work publicly…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q6_artistic_maturity === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q6_artistic_maturity !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q6_artistic_maturity !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q6"
              value={option}
              checked={formData.cf_q6_artistic_maturity === option}
              onChange={(e) => setFormData({ ...formData, cf_q6_artistic_maturity: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I hide it — too scared of judgment"}
              {option === 'B' && "I share but minimize it (\"just playing around\")"}
              {option === 'C' && "I share confidently, even imperfect work"}
              {option === 'D' && "I share with full ownership — this is my art, take it or leave it"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q7: Creation Intent */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        The primary intent behind my creative work is…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q7_creation_intent === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q7_creation_intent !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q7_creation_intent !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q7"
              value={option}
              checked={formData.cf_q7_creation_intent === option}
              onChange={(e) => setFormData({ ...formData, cf_q7_creation_intent: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Validation — I need to know people care"}
              {option === 'B' && "Income — it's a means to make money"}
              {option === 'C' && "Expression — I create to process and share"}
              {option === 'D' && "Impact — I create to shift something in others"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q8: Creative Flow AI */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "AI helps me explore weird mashups and ideas I wouldn't try solo."      </div>
      <div style={scaleContainerStyle}>
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => setFormData({ ...formData, cf_q8_ai_flow: num })}
            style={scaleButtonStyle(num, formData.cf_q8_ai_flow === num)}
            onMouseEnter={(e) => {
              if (formData.cf_q8_ai_flow !== num) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q8_ai_flow !== num) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            {num}
          </button>
        ))}
      </div>
      <div style={{ fontSize: '12px', color: '#999', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Nah, it just confuses me</span>
        <span>Yes, it's my chaotic muse</span>
      </div>
    </div>

    {/* CF Q9: Security Individuality */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        As AI and tech evolve, I feel…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q9_security_individuality === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q9_security_individuality !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q9_security_individuality !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q9"
              value={option}
              checked={formData.cf_q9_security_individuality === option}
              onChange={(e) => setFormData({ ...formData, cf_q9_security_individuality: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Threatened — like I'm becoming replaceable or irrelevant"}
              {option === 'B' && "Uncertain — questioning what makes me uniquely valuable"}
              {option === 'C' && "Grounded — my individuality is secure regardless of tech"}
              {option === 'D' && "Empowered — tech amplifies what makes me irreplaceable"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q10: Content Areas */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "Select the topics you'd naturally talk about (choose your top areas):"      </div>
      <div style={checkboxGroupStyle}>
        {[
          "Personal growth",
          "Love/relationships",
          "Work/entrepreneurship",
          "Money/finance",
          "Creativity/art",
          "Health/wellness",
          "Technology/AI",
          "Culture/community"
        ].map((option) => (
          <label
            key={option}
            style={(formData.cf_q10_content_areas || []).includes(option) ? checkboxLabelSelectedStyle : checkboxLabelStyle}
            onMouseEnter={(e) => {
              if (!(formData.cf_q10_content_areas || []).includes(option)) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!(formData.cf_q10_content_areas || []).includes(option)) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="checkbox"
              checked={(formData.cf_q10_content_areas || []).includes(option)}
              onChange={() => handleCheckboxChange('cf_q10_content_areas', option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q11: Perspective Flexibility */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        "In the last month, I've engaged with ideas or people who…"      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q11_perspective_flexibility === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q11_perspective_flexibility !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q11_perspective_flexibility !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q11"
              value={option}
              checked={formData.cf_q11_perspective_flexibility === option}
              onChange={(e) => setFormData({ ...formData, cf_q11_perspective_flexibility: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Confirmed what I already believe"}
              {option === 'B' && "Slightly challenged me but stayed comfortable"}
              {option === 'C' && "Made me genuinely reconsider my position"}
              {option === 'D' && "Completely shifted how I see something"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q12: Path Awareness */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When considering my next career/business move…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q12_path_awareness === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q12_path_awareness !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q12_path_awareness !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q12"
              value={option}
              checked={formData.cf_q12_path_awareness === option}
              onChange={(e) => setFormData({ ...formData, cf_q12_path_awareness: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I see no options (feel trapped)"}
              {option === 'B' && "I see the obvious path everyone else takes"}
              {option === 'C' && "I see 2-3 alternative approaches"}
              {option === 'D' && "I design custom paths based on my unique strengths"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q13: Creative Fulfillment */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        After creating or building something, I typically feel…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q13_creative_fulfillment === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q13_creative_fulfillment !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q13_creative_fulfillment !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q13"
              value={option}
              checked={formData.cf_q13_creative_fulfillment === option}
              onChange={(e) => setFormData({ ...formData, cf_q13_creative_fulfillment: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Drained and empty"}
              {option === 'B' && "Relieved it's done"}
              {option === 'C' && "Energized but exhausted (good tired)"}
              {option === 'D' && "Fulfilled and alive"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q14: Creative Blocks */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        What most often stops you from creating? (select all that apply)
      </div>
      <div style={checkboxGroupStyle}>
        {[
          "Fear of judgment or criticism",
          "Perfectionism (it's never good enough)",
          "Time scarcity (always other priorities)",
          "Energy depletion (too drained to create)",
          "Unclear direction (don't know what to make)",
          "Imposter syndrome (who am I to share this?)",
          "Nothing — I create consistently"
        ].map((option) => (
          <label
            key={option}
            style={(formData.cf_q14_creative_blocks || []).includes(option) ? checkboxLabelSelectedStyle : checkboxLabelStyle}
            onMouseEnter={(e) => {
              if (!(formData.cf_q14_creative_blocks || []).includes(option)) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (!(formData.cf_q14_creative_blocks || []).includes(option)) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="checkbox"
              checked={(formData.cf_q14_creative_blocks || []).includes(option)}
              onChange={() => handleCheckboxChange('cf_q14_creative_blocks', option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q15: Resistance Pattern */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        When resistance shows up in my creative process…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q15_resistance_pattern === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q15_resistance_pattern !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q15_resistance_pattern !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q15"
              value={option}
              checked={formData.cf_q15_resistance_pattern === option}
              onChange={(e) => setFormData({ ...formData, cf_q15_resistance_pattern: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "I stop and avoid it"}
              {option === 'B' && "I push through with willpower"}
              {option === 'C' && "I pause and investigate what's underneath"}
              {option === 'D' && "I use it as information to redirect"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q16: Work Curiosity */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        The overlap between my curiosities and my paid work is…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q16_work_curiosity === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q16_work_curiosity !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q16_work_curiosity !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q16"
              value={option}
              checked={formData.cf_q16_work_curiosity === option}
              onChange={(e) => setFormData({ ...formData, cf_q16_work_curiosity: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "Non-existent — I create for money, explore for fun (separate worlds)"}
              {option === 'B' && "Small — occasional overlap but mostly disconnected"}
              {option === 'C' && "Growing — I'm actively weaving them together"}
              {option === 'D' && "Integrated — my curiosities ARE my business"}
            </span>
          </label>
        ))}
      </div>
    </div>

    {/* CF Q17: Brand Authenticity */}
    <div style={questionStyle}>
      <div style={questionTextStyle}>
        My personal brand / public identity is…
      </div>
      <div style={radioGroupStyle}>
        {['A', 'B', 'C', 'D'].map((option) => (
          <label
            key={option}
            style={formData.cf_q17_brand_authenticity === option ? radioLabelSelectedStyle : radioLabelStyle}
            onMouseEnter={(e) => {
              if (formData.cf_q17_brand_authenticity !== option) {
                e.currentTarget.style.borderColor = '#44AAFF';
              }
            }}
            onMouseLeave={(e) => {
              if (formData.cf_q17_brand_authenticity !== option) {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }
            }}
          >
            <input
              type="radio"
              name="cf_q17"
              value={option}
              checked={formData.cf_q17_brand_authenticity === option}
              onChange={(e) => setFormData({ ...formData, cf_q17_brand_authenticity: e.target.value })}
              style={{ marginTop: '2px' }}
            />
            <span>
              {option === 'A' && "A persona — not really me, just what works"}
              {option === 'B' && "Partially authentic — some of me shows through"}
              {option === 'C' && "Mostly me — I'm honest about who I am"}
              {option === 'D' && "Fully integrated — my work IS my truth"}
            </span>
          </label>
        ))}
      </div>
    </div>
  </div>
)}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '16px' }}>
            <button
              onClick={handleBack}
              style={secondaryButtonStyle}
              disabled={isSubmitting}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              style={buttonStyle}
              disabled={isSubmitting}
            >
              {currentPillar < 4 ? 'Continue →' : isSubmitting ? 'Saving...' : 'Complete Assessment'}
            </button>
          </div>

          {errors.submit && (
            <div style={{ ...errorStyle, textAlign: 'center', marginTop: '16px' }}>
              {errors.submit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}