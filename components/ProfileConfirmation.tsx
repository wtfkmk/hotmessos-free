import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileConfirmationProps {
  userId: string;
  onConfirm: () => void;
  onEdit: () => void;
  onSaveAndExit: () => void;
}

interface ProfileData {
  business_models: string[];
  elevator_pitch: string;
  team_size: string;
  working_style: string;
  monthly_revenue: string;
  hours_per_week: string;
  monthly_budget: string;
  platforms: string[];
  biggest_constraint: string;
  primary_goal: string;
}

const LABEL_MAP: Record<string, string> = {
  // team_size
  'solo': 'Solo (just me)',
  'small': 'Small team (2–5 people)',
  'growing': 'Growing team (6–15 people)',
  'established': 'Established company (16+ people)',
  // working_style
  'hands-on': 'Hands-on doer (I execute everything)',
  'delegator': 'Strategic delegator (I outsource/hire)',
  'mix': 'Mix of both',
  // monthly_revenue
  '0-1k': '$0–1K',
  '1k-5k': '$1K–5K',
  '5k-10k': '$5K–10K',
  '10k-25k': '$10K–25K',
  '25k-50k': '$25K–50K',
  '50k+': '$50K+',
  // hours_per_week
  '5': '0–5 hours/week',
  '10': '5–10 hours/week',
  '20': '10–20 hours/week',
  '30': '20–30 hours/week',
  '40': '30+ hours/week',
  // monthly_budget
  '0': '$0',
  '1-500': '$1–500',
  '500-1k': '$500–1K',
  '1k-2.5k': '$1K–2.5K',
  '2.5k-5k': '$2.5K–5K',
  '5k+': '$5K+',
  // biggest_constraint
  'time': 'Time (can\'t keep up)',
  'money': 'Money (can\'t invest)',
  'skills': 'Skills (don\'t know how)',
  'ideas': 'Ideas (don\'t know what to do)',
  'consistency': 'Consistency (can\'t stick with it)',
  'team': 'Team (need help but can\'t hire)',
  // primary_goal
  'grow-audience': 'Grow audience',
  'increase-revenue': 'Increase revenue',
  'launch-offer': 'Launch new offer',
  'build-authority': 'Build authority/credibility',
  'improve-systems': 'Improve systems/operations',
  'scale-team': 'Scale team',
};

const fmt = (value: string): string => LABEL_MAP[value] || value || '—';

export default function ProfileConfirmation({
  userId,
  onConfirm,
  onEdit,
  onSaveAndExit
}: ProfileConfirmationProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('business_models, elevator_pitch, team_size, working_style, monthly_revenue, hours_per_week, monthly_budget, platforms, biggest_constraint, primary_goal')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          business_models: data.business_models || [],
          elevator_pitch: data.elevator_pitch || '',
          team_size: data.team_size || '',
          working_style: data.working_style || '',
          monthly_revenue: data.monthly_revenue || '',
          hours_per_week: data.hours_per_week?.toString() || '',
          monthly_budget: data.monthly_budget || '',
          platforms: data.platforms || [],
          biggest_constraint: data.biggest_constraint || '',
          primary_goal: data.primary_goal || '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
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

  const headingStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#0a0a0a',
    lineHeight: 1.2
  };

  const subheadingStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px',
    lineHeight: 1.5
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #f0f0f0'
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '16px'
  };

  const fieldRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    gap: '24px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#666',
    minWidth: '180px',
    flexShrink: 0
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#0a0a0a',
    fontWeight: 500,
    flex: 1,
    textAlign: 'right' as const
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
    transition: 'all 0.2s'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={grainStyle} />
        <div style={glowStyle} />
        <div style={contentStyle}>
          <div style={cardStyle}>
            <div style={gradientBorderStyle} />
            <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '16px', color: '#666' }}>
              Loading your profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div style={pageStyle}>
        <div style={grainStyle} />
        <div style={glowStyle} />
        <div style={contentStyle}>
          <div style={cardStyle}>
            <div style={gradientBorderStyle} />
            <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: '16px', color: '#ff4444' }}>
              {error || 'Profile not found'}
              <div style={{ marginTop: '24px' }}>
                <button onClick={onEdit} style={buttonStyle}>
                  Create Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />

      <div style={contentStyle}>
        <div style={cardStyle}>
          <div style={gradientBorderStyle} />

          {/* Save & Exit Button */}
          <button
            onClick={onSaveAndExit}
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
          <div style={{ marginBottom: '48px' }}>
            <h1 style={headingStyle}>Confirm Your Profile</h1>
            <p style={subheadingStyle}>
              Review your information before continuing to the diagnostic. You can edit if anything needs updating.
            </p>
          </div>

          {/* Your Business */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Your Business</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>What you do</div>
              <div style={{ ...valueStyle, textAlign: 'right' }}>
                {profileData.business_models.length > 0
                  ? profileData.business_models.join(', ')
                  : '—'}
              </div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Elevator pitch</div>
              <div style={{ ...valueStyle, fontStyle: profileData.elevator_pitch ? 'normal' : 'italic' }}>
                {profileData.elevator_pitch || '—'}
              </div>
            </div>
          </div>

          {/* Team & Style */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Team & Working Style</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Team size</div>
              <div style={valueStyle}>{fmt(profileData.team_size)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Working style</div>
              <div style={valueStyle}>{fmt(profileData.working_style)}</div>
            </div>
          </div>

          {/* Business Metrics */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Business Metrics</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Monthly revenue</div>
              <div style={valueStyle}>{fmt(profileData.monthly_revenue)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Hours/week for growth</div>
              <div style={valueStyle}>{fmt(profileData.hours_per_week)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Monthly marketing budget</div>
              <div style={valueStyle}>{fmt(profileData.monthly_budget)}</div>
            </div>
          </div>

          {/* Top Platforms */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Top Platforms (ranked)</div>
            {profileData.platforms.length > 0 ? (
              profileData.platforms.slice(0, 5).map((platform, i) => (
                <div key={platform} style={fieldRowStyle}>
                  <div style={labelStyle}>#{i + 1}</div>
                  <div style={valueStyle}>{platform}</div>
                </div>
              ))
            ) : (
              <div style={{ ...valueStyle, textAlign: 'left' }}>—</div>
            )}
          </div>

          {/* Your Focus */}
          <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: '48px' }}>
            <div style={sectionTitleStyle}>Your Focus</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Biggest constraint</div>
              <div style={valueStyle}>{fmt(profileData.biggest_constraint)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Primary 90-day goal</div>
              <div style={valueStyle}>{fmt(profileData.primary_goal)}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <button
              onClick={onEdit}
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#44AAFF';
                e.currentTarget.style.color = '#44AAFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.color = '#0a0a0a';
              }}
            >
              Edit My Profile
            </button>
            <button
              onClick={onConfirm}
              style={buttonStyle}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              This looks good, continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
