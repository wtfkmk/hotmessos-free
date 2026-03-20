interface VideoTransitionProps {
  title: string;
  description?: string;
  message?: string; // alias for description
  onContinue: () => void;
  onBack?: () => void;
  duration?: number;
}

export default function VideoTransition({
  title,
  description,
  message,
  onContinue,
  onBack,
  duration = 3
}: VideoTransitionProps) {
  const body = message ?? description;
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#44FF88',
      fontFamily: '"DM Mono", monospace'
    }}>

      {/* Video placeholder */}
      <div style={{
        width: '100%',
        maxWidth: '720px',
        aspectRatio: '16 / 9',
        background: '#111',
        border: '2px dashed rgba(68,170,255,0.35)',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '40px',
        gap: '16px',
      }}>
        {/* Play icon */}
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="32" r="31" stroke="rgba(68,170,255,0.4)" strokeWidth="2"/>
          <polygon points="26,20 48,32 26,44" fill="rgba(68,170,255,0.5)"/>
        </svg>
        <span style={{
          fontSize: '13px',
          color: 'rgba(68,170,255,0.5)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
        }}>
          Video coming soon
        </span>
      </div>

      <h2 style={{ fontSize: '24px', marginBottom: '16px', textAlign: 'center' as const, maxWidth: '600px' }}>
        {title}
      </h2>
      {body && (
        <p style={{ fontSize: '16px', color: '#888', marginBottom: '32px', textAlign: 'center' as const, maxWidth: '540px', lineHeight: 1.6 }}>
          {body}
        </p>
      )}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#aaa',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"DM Mono", monospace',
            }}
          >
            ← Back
          </button>
        )}
        <button
          onClick={onContinue}
          style={{
            padding: '12px 32px',
            background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#0a0a0a',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: '"DM Mono", monospace',
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
