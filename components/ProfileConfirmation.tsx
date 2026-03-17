import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProfileConfirmationProps {
  userEmail: string;
  onConfirm: () => void;
  onEdit: () => void;
  onSaveAndExit: () => void;
}

interface ProfileData {
  name: string;
  pronouns: string;
  location: string;
  timezone: string;
  industry: string;
  role: string;
  experience_level: string;
  business_stage: string;
  primary_challenge: string;
  monthly_revenue: string;
}

export default function ProfileConfirmation({ 
  userEmail, 
  onConfirm, 
  onEdit,
  onSaveAndExit 
}: ProfileConfirmationProps) {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userEmail]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || '',
          pronouns: data.pronouns || '',
          location: data.location || '',
          timezone: data.timezone || '',
          industry: data.industry || '',
          role: data.role || '',
          experience_level: data.experience_level || '',
          business_stage: data.business_stage || '',
          primary_challenge: data.primary_challenge || '',
          monthly_revenue: data.monthly_revenue || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Styles matching the design system
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

  const loadingStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: '60px 20px',
    fontSize: '16px',
    color: '#666'
  };

  const errorStyle: React.CSSProperties = {
    textAlign: 'center' as const,
    padding: '60px 20px',
    fontSize: '16px',
    color: '#ff4444'
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={grainStyle} />
        <div style={glowStyle} />
        <div style={contentStyle}>
          <div style={{ ...cardStyle }}>
            <div style={gradientBorderStyle} />
            <div style={loadingStyle}>Loading your profile...</div>
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
          <div style={{ ...cardStyle }}>
            <div style={gradientBorderStyle} />
            <div style={errorStyle}>
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

  const formatValue = (value: string): string => {
    if (!value) return '—';
    // Convert snake_case to Title Case
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      
      <div style={contentStyle}>
        <div style={{ ...cardStyle }}>
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

          {/* Basic Information */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Basic Information</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Name</div>
              <div style={valueStyle}>{profileData.name || '—'}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Pronouns</div>
              <div style={valueStyle}>{formatValue(profileData.pronouns)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Location</div>
              <div style={valueStyle}>{profileData.location || '—'}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Timezone</div>
              <div style={valueStyle}>{profileData.timezone || '—'}</div>
            </div>
          </div>

          {/* Professional Background */}
          <div style={sectionStyle}>
            <div style={sectionTitleStyle}>Professional Background</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Industry</div>
              <div style={valueStyle}>{formatValue(profileData.industry)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Role</div>
              <div style={valueStyle}>{formatValue(profileData.role)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Experience Level</div>
              <div style={valueStyle}>{formatValue(profileData.experience_level)}</div>
            </div>
          </div>

          {/* Business Information */}
          <div style={{ ...sectionStyle, borderBottom: 'none', marginBottom: '48px' }}>
            <div style={sectionTitleStyle}>Business Information</div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Business Stage</div>
              <div style={valueStyle}>{formatValue(profileData.business_stage)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Primary Challenge</div>
              <div style={valueStyle}>{formatValue(profileData.primary_challenge)}</div>
            </div>
            <div style={fieldRowStyle}>
              <div style={labelStyle}>Monthly Revenue</div>
              <div style={valueStyle}>{formatValue(profileData.monthly_revenue)}</div>
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
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              This looks good, continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}