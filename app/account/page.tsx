// app/account/page.tsx
// Main account dashboard - shows activity, reports, profile management

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "profile" | "data">("overview");
  
  // Data states
  const [profile, setProfile] = useState<any>(null);
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [chatUsage, setChatUsage] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      router.push("/");
      return;
    }
    setUser(session.user);
    loadAccountData(session.user.id, session.user.email!);
  };

  const loadAccountData = async (userId: string, email: string) => {
    setLoading(true);
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();
      setProfile(profileData);

      // Load quiz history
      const { data: quizData } = await supabase
        .from("quiz_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setQuizHistory(quizData || []);

      // Load paid diagnostics
      const { data: diagnosticData } = await supabase
        .from("paid_diagnostics")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false });
      setDiagnostics(diagnosticData || []);

      // Load recent chat activity
      const { data: chatData } = await supabase
        .from("chat_messages")
        .select("chat_mode, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setChatUsage(chatData || []);
    } catch (error) {
      console.error("Error loading account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportUserData = async () => {
    const exportData = {
      user: {
        email: user.email,
        created_at: user.created_at,
      },
      profile,
      quiz_history: quizHistory,
      diagnostics: diagnostics.map(d => ({
        id: d.id,
        status: d.status,
        created_at: d.created_at,
        completed_at: d.completed_at,
        // Don't include full report in export (too large)
      })),
      chat_usage_count: chatUsage.length,
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hot-mess-os-data-${user.email}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Styles
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "'DM Mono', monospace",
    color: "#fff",
    padding: "2rem 1.5rem",
  };

  const cardStyle: React.CSSProperties = {
    background: "#ffffff",
    border: "2px solid",
    borderImage: "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%) 1",
    borderRadius: "6px",
    padding: "2rem",
    marginBottom: "1.5rem",
  };

  const tabBtn = (isActive: boolean): React.CSSProperties => ({
    background: isActive ? "linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)" : "rgba(255,255,255,0.05)",
    border: isActive ? "none" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    padding: "0.75rem 1.5rem",
    color: isActive ? "#ffffff" : "#999",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: isActive ? 700 : 500,
    fontFamily: "inherit",
    transition: "all 0.2s",
  });

  const gradBtn: React.CSSProperties = {
    background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
    border: "none",
    borderRadius: "6px",
    padding: "0.85rem 1.5rem",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  };

  const statCard = (icon: string, label: string, value: string | number, color: string): React.ReactNode => (
    <div style={{
      background: "#ffffff",
      border: `2px solid ${color}`,
      borderRadius: "6px",
      padding: "1.5rem",
      textAlign: "center" as const,
    }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "0.25rem" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.85rem", color: "#666" }}>{label}</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" as const }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚙️</div>
          <div style={{ color: "#666" }}>Loading your account...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "3rem", textAlign: "center" as const }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "0.5rem",
          }}>
            Your Account
          </h1>
          <p style={{ color: "#666", fontSize: "1rem" }}>{user?.email}</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap" as const,
          justifyContent: "center",
        }}>
          <button onClick={() => setActiveTab("overview")} style={tabBtn(activeTab === "overview")}>
            📊 Overview
          </button>
          <button onClick={() => setActiveTab("activity")} style={tabBtn(activeTab === "activity")}>
            📈 Activity
          </button>
          <button onClick={() => setActiveTab("profile")} style={tabBtn(activeTab === "profile")}>
            👤 Profile
          </button>
          <button onClick={() => setActiveTab("data")} style={tabBtn(activeTab === "data")}>
            💾 Data & Privacy
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}>
              {statCard("🎯", "Chaos Checks", quizHistory.length, "rgba(68,170,255,0.3)")}
              {statCard("📊", "Diagnostics", diagnostics.length, "rgba(255,140,66,0.3)")}
              {statCard("💬", "Chat Messages", chatUsage.length, "rgba(68,255,136,0.3)")}
              {statCard("✅", "Profile Complete", profile ? "Yes" : "No", profile ? "rgba(68,255,136,0.3)" : "rgba(255,140,66,0.3)")}
            </div>

            {/* Recent Activity */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.5rem" }}>
                Recent Activity
              </h2>
              
              {quizHistory.length === 0 && diagnostics.length === 0 && (
                <div style={{ textAlign: "center" as const, padding: "2rem", color: "#666" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌱</div>
                  <p>No activity yet. Take your first chaos check!</p>
                  <button
                    onClick={() => router.push("/")}
                    style={{ ...gradBtn, marginTop: "1rem" }}
                  >
                    Get Started →
                  </button>
                </div>
              )}

              {/* Quiz History */}
              {quizHistory.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                    Chaos Checks
                  </h3>
                  {quizHistory.slice(0, 5).map((quiz) => (
                    <div key={quiz.id} style={{
                      padding: "1rem",
                      background: "rgba(68,170,255,0.05)",
                      borderRadius: "6px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: "0.25rem" }}>
                          {quiz.meter_label} · {quiz.archetype}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                          {new Date(quiz.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#44AAFF",
                      }}>
                        {Math.round(quiz.score * 10) / 10}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Diagnostic History */}
              {diagnostics.length > 0 && (
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                    Paid Diagnostics
                  </h3>
                  {diagnostics.map((diagnostic) => (
                    <div key={diagnostic.id} style={{
                      padding: "1rem",
                      background: "rgba(255,140,66,0.05)",
                      borderRadius: "6px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: "0.25rem" }}>
                          Status: {diagnostic.status === "completed" ? "✅ Completed" : diagnostic.status === "processing" ? "⚙️ Processing" : "⏳ Pending"}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#666" }}>
                          Started: {new Date(diagnostic.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {diagnostic.status === "pending" && (
                        <button
                          onClick={() => router.push("/")}
                          style={{
                            background: "linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.6rem 1rem",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Resume →
                        </button>
                      )}
                      {diagnostic.status === "completed" && (
                        <button
                          onClick={() => router.push("/")}
                          style={{
                            background: "none",
                            border: "2px solid #44AAFF",
                            borderRadius: "4px",
                            padding: "0.6rem 1rem",
                            color: "#44AAFF",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {!profile && (
              <div style={cardStyle}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                  Complete Your Profile
                </h3>
                <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                  Help us personalize your experience by completing your profile setup.
                </p>
                <button
  onClick={() => {
    console.log("🖱️ Complete Profile (Overview) clicked!");
    sessionStorage.setItem('editProfile', 'true');
    console.log("💾 Set editProfile flag:", sessionStorage.getItem('editProfile'));
    router.push("/");
  }}
  style={gradBtn}
>
  Complete Profile →
</button>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.5rem" }}>
              All Activity
            </h2>
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Complete activity log coming soon. For now, see Overview tab for recent activity.
            </p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.5rem" }}>
              Your Profile
            </h2>
            {!profile ? (
              <div style={{ textAlign: "center" as const, padding: "2rem" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
                <p style={{ color: "#666", marginBottom: "1.5rem" }}>
                  You haven't completed your profile yet.
                </p>
<button
  onClick={() => {
    console.log("🖱️ Complete Profile (Profile Tab) clicked!");
    sessionStorage.setItem('editProfile', 'true');
    console.log("💾 Set editProfile flag:", sessionStorage.getItem('editProfile'));
    router.push("/");
  }}
  style={gradBtn}
>
  Complete Profile →
</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                      Business Model
                    </div>
                    <div style={{ color: "#1a1a1a" }}>
                      {Array.isArray(profile.business_models) 
                        ? profile.business_models.join(", ") 
                        : profile.business_models}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                      Elevator Pitch
                    </div>
                    <div style={{ color: "#1a1a1a" }}>{profile.elevator_pitch}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Team Size
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.team_size}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Working Style
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.working_style}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Monthly Revenue
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.monthly_revenue}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Hours Per Week
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.hours_per_week}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Monthly Budget
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.monthly_budget}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Biggest Constraint
                      </div>
                      <div style={{ color: "#1a1a1a" }}>{profile.biggest_constraint}</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600, marginBottom: "0.5rem" }}>
                      Platform Priorities
                    </div>
                    <div style={{ color: "#1a1a1a" }}>
                      {Array.isArray(profile.platforms) 
                        ? profile.platforms.join(", ") 
                        : profile.platforms}
                    </div>
                  </div>
                </div>

<button
  onClick={() => {
    console.log("🖱️ Edit Profile clicked!");
    // Set flag in sessionStorage
    sessionStorage.setItem('editProfile', 'true');
    console.log("💾 Set editProfile flag:", sessionStorage.getItem('editProfile'));
    router.push("/");
  }}
  style={{ ...gradBtn, marginTop: "2rem" }}
>
  Edit Profile
</button>
              </div>
            )}
          </div>
        )}

        {/* Data & Privacy Tab */}
        {activeTab === "data" && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1a1a", marginBottom: "1.5rem" }}>
              Your Data & Privacy
            </h2>
            
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                Export Your Data
              </h3>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                Download a complete copy of all your data in JSON format.
              </p>
              <button onClick={exportUserData} style={gradBtn}>
                📥 Download JSON Export
              </button>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                What We Store
              </h3>
              <ul style={{ color: "#666", lineHeight: 1.8, paddingLeft: "1.5rem" }}>
                <li>Profile information (business details, constraints, goals)</li>
                <li>Quiz results and history</li>
                <li>Paid diagnostic responses and reports</li>
                <li>Chat conversation history</li>
                <li>Account email and authentication data</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1rem" }}>
                Data Retention
              </h3>
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                Your data is stored securely and used only to provide you with personalized diagnostic results and recommendations. You can delete your account and all associated data at any time.
              </p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: "center" as const, marginTop: "2rem" }}>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              fontSize: "0.95rem",
              textDecoration: "underline",
              fontFamily: "inherit",
            }}
          >
            ← Back to Hot Mess OS
          </button>
        </div>
      </div>
    </div>
  );
}