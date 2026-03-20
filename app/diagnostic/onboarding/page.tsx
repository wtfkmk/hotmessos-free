"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"activating" | "success" | "error">("activating");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      // No session_id — send home
      router.replace("/");
      return;
    }
    activateDiagnostic(sessionId);
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activateDiagnostic = async (stripeSessionId: string) => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the current user's session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        // Not logged in — redirect to home so they can log in, then resume
        router.replace("/?resume=true");
        return;
      }

      // Call the activate API to link the Stripe session to this user_id.
      // This handles the race condition where the webhook hasn't fired yet.
      const res = await fetch("/api/diagnostic/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ stripeSessionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Activation failed");
      }

      setStatus("success");

      // Short pause so the user sees the success state, then start the diagnostic
      setTimeout(() => {
        router.replace("/?resume=true");
      }, 1500);

    } catch (err: any) {
      console.error("Onboarding activation error:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  const spin: React.CSSProperties = {
    width: "50px",
    height: "50px",
    border: "4px solid #2a2a2a",
    borderTop: "4px solid #FF8C42",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

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
      padding: "2rem",
      textAlign: "center",
    }}>
      {status === "activating" && (
        <>
          <div style={spin} />
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
            Setting up your diagnostic...
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <div style={{ fontSize: "3rem" }}>✅</div>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            background: "linear-gradient(135deg, #44FF88 0%, #44AAFF 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            You're in!
          </h1>
          <p style={{ fontSize: "1rem", color: "#999" }}>
            Starting your diagnostic...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FF8C42" }}>
            Almost there
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#999", maxWidth: "400px" }}>
            Your payment was received but we hit a snag setting up your account.
            {errorMsg ? ` (${errorMsg})` : ""} Click below to continue or contact support.
          </p>
          <button
            onClick={() => router.replace("/?resume=true")}
            style={{
              background: "linear-gradient(135deg, #FF8C42, #FF4ECD)",
              border: "none",
              borderRadius: "8px",
              padding: "12px 28px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Continue to Diagnostic →
          </button>
        </>
      )}

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
