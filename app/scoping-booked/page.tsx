// app/scoping-booked/page.tsx
// Success page shown after scoping session payment

export default function ScopingBooked() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: "520px",
        textAlign: "center" as const,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "8px",
        padding: "3rem 2rem",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>✅</div>
        
        <h1 style={{
          fontSize: "2rem",
          fontWeight: 900,
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #44FF88 0%, #44AAFF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Scoping Session Booked!
        </h1>
        
        <p style={{
          fontSize: "1rem",
          color: "#ccc",
          lineHeight: 1.7,
          marginBottom: "2rem",
        }}>
          Payment confirmed. Check your email for a Calendly link to schedule your 45-60 minute deep-dive session with KMK.
        </p>

        <div style={{
          background: "rgba(68,255,136,0.08)",
          border: "1px solid rgba(68,255,136,0.25)",
          borderRadius: "6px",
          padding: "1.25rem",
          textAlign: "left" as const,
          marginBottom: "2rem",
        }}>
          <h2 style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#44FF88",
            marginBottom: "0.75rem",
          }}>
            What happens next:
          </h2>
          <ul style={{
            fontSize: "0.85rem",
            color: "#ccc",
            lineHeight: 1.8,
            paddingLeft: "1.25rem",
          }}>
            <li>You'll receive an email with a Calendly link within 15 minutes</li>
            <li>Book a time that works for your 60-minute scoping session</li>
            <li>We'll dive deep into your idea, map out what's possible, and deliver a written scope doc</li>
            <li>Your $297 credits toward the custom build if we proceed</li>
          </ul>
        </div>

        <a
          href="/"
          style={{
            display: "inline-block",
            padding: "0.85rem 2rem",
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
            border: "none",
            borderRadius: "5px",
            color: "#fff",
            fontSize: "0.95rem",
            fontWeight: 700,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          ← Back to Hot Mess OS
        </a>
      </div>
    </div>
  );
}