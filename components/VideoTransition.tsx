// components/VideoTransition.tsx
// Reusable video placeholder for section transitions

interface VideoTransitionProps {
  title: string;
  duration?: number;
}

export default function VideoTransition({ title, duration = 3 }: VideoTransitionProps) {
  return (
    <div style={{
      width: '100%',
      height: '400px',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#44FF88',
      fontFamily: '"DM Mono", monospace',
      fontSize: '24px'
    }}>
      {title}
    </div>
  );
}
