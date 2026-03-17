"use client";

import React, { useState, useEffect } from 'react';
import { savePillarProgress, loadPillarProgress } from '@/lib/resumeLogic';

interface PillarAssessmentProps {
  userEmail: string;
  onComplete: (data: PillarData) => void;
  onBack?: () => void;
  onSaveAndExit: () => void;
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
  ds_q2_ai_reliance: string;
  ds_q3_ai_critique: string;
  ds_q4_ai_tool_selection: string;
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
  
  // RELATIONSHIPS (16 questions)
  r_q1_inner_voice: string;
  r_q2_conflict_approach: string;
  r_q3_receive_feedback: string;
  r_q4_give_feedback: string;
  r_q5_boundaries: string;
  r_q6_network_intention: string;
  r_q7_collab_dynamics: string;
  r_q8_mentor_presence: string;
  r_q9_ask_for_help: string;
  r_q10_community_reciprocity: string;
  r_q11_public_vulnerability: string;
  r_q12_leadership_style: string;
  r_q13_network_quality: number;
  r_q14_relationship_maintenance: string;
  r_q15_people_energy: string;
  r_q16_collaboration_capacity: string;
  
  // CREATIVE FLOW (16 questions)
  cf_q1_spark_to_ship: string;
  cf_q2_creative_resistance: string;
  cf_q3_perfectionism: string;
  cf_q4_creative_identity: string;
  cf_q5_constraints_creativity: string;
  cf_q6_inspiration_sources: string;
  cf_q7_idea_capture: string;
  cf_q8_creative_environment: string;
  cf_q9_deep_work: string;
  cf_q10_creative_rhythm: string;
  cf_q11_experimentation: string;
  cf_q12_finishing: string;
  cf_q13_creative_confidence: number;
  cf_q14_fear_judgment: string;
  cf_q15_creative_recovery: string;
  cf_q16_vision_execution: string;
}

export default function PillarAssessment({
  userEmail,
  onComplete,
  onBack,
  onSaveAndExit
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
    ds_q2_ai_reliance: '',
    ds_q3_ai_critique: '',
    ds_q4_ai_tool_selection: '',
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
    r_q1_inner_voice: '',
    r_q2_conflict_approach: '',
    r_q3_receive_feedback: '',
    r_q4_give_feedback: '',
    r_q5_boundaries: '',
    r_q6_network_intention: '',
    r_q7_collab_dynamics: '',
    r_q8_mentor_presence: '',
    r_q9_ask_for_help: '',
    r_q10_community_reciprocity: '',
    r_q11_public_vulnerability: '',
    r_q12_leadership_style: '',
    r_q13_network_quality: 0,
    r_q14_relationship_maintenance: '',
    r_q15_people_energy: '',
    r_q16_collaboration_capacity: '',
    
    // CREATIVE FLOW
    cf_q1_spark_to_ship: '',
    cf_q2_creative_resistance: '',
    cf_q3_perfectionism: '',
    cf_q4_creative_identity: '',
    cf_q5_constraints_creativity: '',
    cf_q6_inspiration_sources: '',
    cf_q7_idea_capture: '',
    cf_q8_creative_environment: '',
    cf_q9_deep_work: '',
    cf_q10_creative_rhythm: '',
    cf_q11_experimentation: '',
    cf_q12_finishing: '',
    cf_q13_creative_confidence: 0,
    cf_q14_fear_judgment: '',
    cf_q15_creative_recovery: '',
    cf_q16_vision_execution: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing progress
  useEffect(() => {
    loadProgress();
  }, [userEmail]);

  const loadProgress = async () => {
    const progress = await loadPillarProgress(userEmail);
    if (progress && progress.data) {
      setFormData(progress.data);
      setCurrentPillar(progress.step > 0 ? progress.step : 1);
      console.log(`✅ Loaded pillar progress: Pillar ${progress.step}`);
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentPillar === 1) {
      // Presence validation
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

    // Add validation for other pillars (TODO)

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
      setCurrentPillar(currentPillar + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

          {/* PILLARS 2-4 PLACEHOLDERS (will add in next message due to length) */}
          {currentPillar > 1 && (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', color: '#666', marginBottom: '16px' }}>
                Pillar {currentPillar} Questions Coming in Next Update
              </h2>
              <p style={{ color: '#999' }}>
                Building all 58 questions across 4 pillars. Use navigation to test flow.
              </p>
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