interface VideoTransitionProps {
  title: string;
  description?: string;
  onContinue: () => void;
  duration?: number;
}

export default function VideoTransition({ 
  title, 
  description,
  onContinue,
  duration = 3 
}: VideoTransitionProps) {
  return (
    <div style={{
      width: '100%',
      minHeight: '400px',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      color: '#44FF88',
      fontFamily: '"DM Mono", monospace'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{title}</h2>
      {description && (
        <p style={{ fontSize: '16px', color: '#888', marginBottom: '24px' }}>
          {description}
        </p>
      )}
      <button
        onClick={onContinue}
        style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
          border: 'none',
          borderRadius: '8px',
          color: '#0a0a0a',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Continue
      </button>
    </div>
  );
}
