"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [sessionId, router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: "20px",
      background: "#0a0a0a",
      color: "#fff",
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        width: "50px",
        height: "50px",
        border: "4px solid #2a2a2a",
        borderTop: "4px solid #FF8C42",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}></div>
      <h1 style={{ 
        fontSize: "1.5rem", 
        fontWeight: 800,
        background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        Payment Successful!
      </h1>
      <p style={{ fontSize: "1rem", color: "#999" }}>
        Redirecting to your diagnostic...
      </p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function DiagnosticOnboarding() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
      }}>
        Loading...
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}