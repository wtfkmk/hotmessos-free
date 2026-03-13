'use client';

export default function ScopingConfirmed() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        background: 'rgba(0,0,0,0.02)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '8px',
        padding: '2.5rem 2rem',
        textAlign: 'center' as const,
      }}>
        
        {/* Success Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1.5rem',
          background: 'linear-gradient(135deg, #44FF88 0%, #44AAFF 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
        }}>
          ✓
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 900,
          color: '#1a1a1a',
          marginBottom: '0.75rem',
          background: 'linear-gradient(135deg, #44FF88 0%, #44AAFF 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Scoping Session Booked!
        </h1>

        {/* Confirmation Text */}
        <p style={{
          color: '#666',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Payment confirmed. Your session is scheduled. Check your email for a calendar invite with all the details.
        </p>

        {/* What Happens Next Box */}
        <div style={{
          background: 'rgba(68, 255, 136, 0.08)',
          border: '1px solid rgba(68, 255, 136, 0.2)',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '2rem',
          textAlign: 'left' as const,
        }}>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#1a1a1a',
            marginBottom: '0.75rem',
            letterSpacing: '0.05em',
          }}>
            WHAT HAPPENS NEXT:
          </div>
          
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: '#666',
            fontSize: '0.85rem',
            lineHeight: 1.8,
          }}>
            <li>You'll receive a calendar invite with Zoom link</li>
            <li>We'll spend 45-60 minutes mapping out your project</li>
            <li>I'll deliver a written scope document with timeline & cost estimate</li>
            <li>Your $297 credits toward the custom build if we proceed</li>
          </ul>
        </div>

        {/* Back Button */}
        <a
          href="https://hotmessos-free.vercel.app"
          style={{
            display: 'inline-block',
            padding: '0.9rem 2rem',
            background: 'linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '0.9rem',
            fontWeight: 700,
            textDecoration: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← Back to Hot Mess OS
        </a>

      </div>
    </div>
  );
}