// components/VideoTransition.tsx
// Reusable video placeholder for section transitions

interface VideoTransitionProps {
  title: string;
  description: string;
  videoUrl?: string; // Optional - if not provided, shows placeholder
  thumbnailUrl?: string;
  onContinue: () => void;
  showSkip?: boolean;
}

export default function VideoTransition({
  title,
  description,
  videoUrl,
  thumbnailUrl,
  onContinue,
  showSkip = true,
}: VideoTransitionProps) {
  const hasVideo = !!videoUrl;

  const gradBtn = {
    background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
    border: "none",
    borderRadius: "6px",
    padding: "0.95rem 2rem",
    color: "#ffffff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.15s, opacity 0.2s",
    fontFamily: "inherit",
    letterSpacing: "0.02em",
  };

  return (
    <div style={{
      maxWidth: "700px",
      margin: "0 auto",
      padding: "2rem 1.5rem",
    }}>
      <div style={{
        background: "#ffffff",
        border: "2px solid",
        borderImage: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%) 1",
        borderRadius: "6px",
        padding: "2rem",
      }}>
        {/* Header */}
        <h2 style={{
          fontSize: "1.8rem",
          fontWeight: 800,
          marginBottom: "1rem",
          color: "#1a1a1a",
        }}>
          {title}
        </h2>
        
        <p style={{
          fontSize: "1rem",
          color: "#666",
          lineHeight: 1.6,
          marginBottom: "2rem",
        }}>
          {description}
        </p>

        {/* Video or Placeholder */}
        {hasVideo ? (
          <video
            controls
            style={{
              width: "100%",
              borderRadius: "8px",
              marginBottom: "2rem",
            }}
            poster={thumbnailUrl}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div style={{
            width: "100%",
            height: "400px",
            background: "linear-gradient(135deg, rgba(68,170,255,0.1) 0%, rgba(68,255,136,0.1) 100%)",
            border: "2px dashed rgba(68,170,255,0.3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "2rem",
          }}>
            <div style={{ textAlign: "center" as const }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎬</div>
              <div style={{ color: "#666", fontSize: "1rem", fontWeight: 600 }}>
                Video Coming Soon
              </div>
              <div style={{ color: "#999", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Placeholder for section intro video
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={onContinue}
            style={gradBtn}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Continue to Questions →
          </button>
          
          {showSkip && (
            <button
              onClick={onContinue}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                fontSize: "0.95rem",
                cursor: "pointer",
                textDecoration: "underline",
                fontFamily: "inherit",
              }}
            >
              Skip video
            </button>
          )}
        </div>
      </div>
    </div>
  );
}