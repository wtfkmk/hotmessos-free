"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

interface ProfileSetupProps {
  email: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function ProfileSetup({ email, onComplete, onCancel }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form state
  const [businessModels, setBusinessModels] = useState<string[]>([]);
  const [elevatorPitch, setElevatorPitch] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [workingStyle, setWorkingStyle] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([
    "Instagram",
    "LinkedIn",
    "TikTok",
    "Website",
    "Email list",
    "YouTube",
    "Facebook",
    "Twitter/X",
  ]);
  const [biggestConstraint, setBiggestConstraint] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");

  const totalSteps = 3;

  // Load existing profile data on mount
  useEffect(() => {
    loadExistingProfile();
  }, [email]);

  const loadExistingProfile = async () => {
    if (!email) return;

    try {
      // Look up by user_id from the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        // No existing profile, that's ok - user will fill fresh
        console.log('No existing profile found');
        return;
      }

      if (data) {
        // Pre-fill the form with existing data
        console.log('✅ Loading existing profile data');
        
        if (data.business_models) setBusinessModels(data.business_models);
        if (data.elevator_pitch) setElevatorPitch(data.elevator_pitch);
        if (data.team_size) setTeamSize(data.team_size);
        if (data.working_style) setWorkingStyle(data.working_style);
        if (data.monthly_revenue) setMonthlyRevenue(data.monthly_revenue);
        if (data.hours_per_week) setHoursPerWeek(data.hours_per_week.toString());
        if (data.monthly_budget) setMonthlyBudget(data.monthly_budget);
        if (data.platforms) setPlatforms(data.platforms);
        if (data.biggest_constraint) setBiggestConstraint(data.biggest_constraint);
        if (data.primary_goal) setPrimaryGoal(data.primary_goal);
        
        console.log('✅ Profile data loaded successfully');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    }
  };

  // Styles
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "#0a0a0a",
    fontFamily: "'DM Mono', 'Fira Mono', 'Courier New', monospace",
    color: "#ffffff",
    position: "relative",
    overflow: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    padding: "2rem",
    maxWidth: "600px",
    width: "100%",
  };

  const gradBtn: React.CSSProperties = {
    background: "linear-gradient(90deg, #FF8C42, #FF4ECD)",
    border: "none",
    borderRadius: "4px",
    padding: "0.9rem 1.5rem",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "0.9rem",
    fontFamily: "inherit",
    letterSpacing: "0.04em",
    cursor: "pointer",
    width: "100%",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.85rem 1rem",
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.5rem",
    color: "#aaa",
    fontSize: "0.85rem",
    fontWeight: 600,
  };

  const handleBusinessModelToggle = (model: string) => {
    if (businessModels.includes(model)) {
      setBusinessModels(businessModels.filter((m) => m !== model));
    } else {
      setBusinessModels([...businessModels, model]);
    }
  };

  const handlePlatformMove = (index: number, direction: "up" | "down") => {
    const newPlatforms = [...platforms];
    if (direction === "up" && index > 0) {
      [newPlatforms[index], newPlatforms[index - 1]] = [
        newPlatforms[index - 1],
        newPlatforms[index],
      ];
    } else if (direction === "down" && index < platforms.length - 1) {
      [newPlatforms[index], newPlatforms[index + 1]] = [
        newPlatforms[index + 1],
        newPlatforms[index],
      ];
    }
    setPlatforms(newPlatforms);
  };

  const saveProfile = async () => {
    console.log("🎯 SAVE PROFILE CLICKED!");
    console.log("📧 Email:", email);
    console.log("📦 Data being sent:", {
      email,
      businessModels,
      elevatorPitch,
      teamSize,
      workingStyle,
      monthlyRevenue,
      hoursPerWeek,
      monthlyBudget,
      platforms,
      biggestConstraint,
      primaryGoal,
    });
    
    setSaving(true);
    try {
      console.log("🔵 Sending request to /api/profile/save...");

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          email,
          businessModels,
          elevatorPitch,
          teamSize,
          workingStyle,
          monthlyRevenue,
          hoursPerWeek: parseInt(hoursPerWeek) || 0,
          monthlyBudget,
          platforms,
          biggestConstraint,
          primaryGoal,
        }),
      });

      console.log("📡 Response status:", response.status);
      const result = await response.json();
      console.log("📥 Response data:", result);

      if (response.ok) {
        console.log("✅ Profile saved successfully! Calling onComplete...");
        onComplete();
      } else {
        console.error("❌ Save failed:", result.error);
        alert("Failed to save profile: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
      alert("Failed to save profile. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) {
      return businessModels.length > 0 && elevatorPitch.trim() && teamSize && workingStyle;
    }
    if (step === 2) {
      return monthlyRevenue && hoursPerWeek && monthlyBudget;
    }
    if (step === 3) {
      return biggestConstraint && primaryGoal;
    }
    return false;
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#666",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "0.5rem",
            }}
          >
            Step {step} of {totalSteps}
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            {step === 1 && "Tell us about you"}
            {step === 2 && "Business metrics"}
            {step === 3 && "Your focus"}
          </h2>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            {step === 1 && "Help us understand your business"}
            {step === 2 && "Time, money, and priorities"}
            {step === 3 && "Where you're stuck and where you're headed"}
          </p>
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={labelStyle}>What do you do? (select all that apply)</label>
              {[
                "Service provider (coaching, consulting, agency)",
                "Product seller (physical goods, software, digital products)",
                "Content creator (courses, memberships, community)",
                "Hybrid (multiple revenue streams)",
              ].map((model) => (
                <div key={model} style={{ marginBottom: "0.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={businessModels.includes(model)}
                      onChange={() => handleBusinessModelToggle(model)}
                      style={{ cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "0.9rem" }}>{model}</span>
                  </label>
                </div>
              ))}
            </div>

            <div>
              <label style={labelStyle}>Fill in the blank: "I do ___ for ___ because ___"</label>
              <textarea
                value={elevatorPitch}
                onChange={(e) => setElevatorPitch(e.target.value)}
                placeholder="e.g., I build custom websites for solopreneurs because they need a professional online presence without the agency price tag"
                style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={labelStyle}>Are you solo or team?</label>
              <select value={teamSize} onChange={(e) => setTeamSize(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="solo">Solo (just me)</option>
                <option value="small">Small team (2-5 people)</option>
                <option value="growing">Growing team (6-15 people)</option>
                <option value="established">Established company (16+ people)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Your working style?</label>
              <select value={workingStyle} onChange={(e) => setWorkingStyle(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="hands-on">Hands-on doer (I execute everything)</option>
                <option value="delegator">Strategic delegator (I outsource/hire)</option>
                <option value="mix">Mix of both</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Business Metrics */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Monthly revenue range?</label>
              <select value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="0-1k">$0-1K</option>
                <option value="1k-5k">$1K-5K</option>
                <option value="5k-10k">$5K-10K</option>
                <option value="10k-25k">$10K-25K</option>
                <option value="25k-50k">$25K-50K</option>
                <option value="50k+">$50K+</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Hours per week for online growth?</label>
              <select value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="5">0-5 hours</option>
                <option value="10">5-10 hours</option>
                <option value="20">10-20 hours</option>
                <option value="30">20-30 hours</option>
                <option value="40">30+ hours</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Monthly marketing budget?</label>
              <select value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="0">$0</option>
                <option value="1-500">$1-500</option>
                <option value="500-1k">$500-1K</option>
                <option value="1k-2.5k">$1K-2.5K</option>
                <option value="2.5k-5k">$2.5K-5K</option>
                <option value="5k+">$5K+</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Rank your platforms (top priority first)</label>
              <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: "0.75rem" }}>
                Use arrows to reorder by importance
              </div>
              {platforms.map((platform, index) => (
                <div
                  key={platform}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    background: "#1a1a1a",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <button
                      onClick={() => handlePlatformMove(index, "up")}
                      disabled={index === 0}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        opacity: index === 0 ? 0.3 : 1,
                        fontSize: "0.7rem",
                      }}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handlePlatformMove(index, "down")}
                      disabled={index === platforms.length - 1}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: index === platforms.length - 1 ? "not-allowed" : "pointer",
                        opacity: index === platforms.length - 1 ? 0.3 : 1,
                        fontSize: "0.7rem",
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  <span style={{ flex: 1, fontSize: "0.9rem" }}>
                    {index + 1}. {platform}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Your Focus */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={labelStyle}>Biggest constraint right now?</label>
              <select
                value={biggestConstraint}
                onChange={(e) => setBiggestConstraint(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select...</option>
                <option value="time">Time (can't keep up)</option>
                <option value="money">Money (can't invest)</option>
                <option value="skills">Skills (don't know how)</option>
                <option value="ideas">Ideas (don't know what to do)</option>
                <option value="consistency">Consistency (can't stick with it)</option>
                <option value="team">Team (need help but can't hire)</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Primary goal for the next 90 days?</label>
              <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} style={inputStyle}>
                <option value="">Select...</option>
                <option value="grow-audience">Grow audience</option>
                <option value="increase-revenue">Increase revenue</option>
                <option value="launch-offer">Launch new offer</option>
                <option value="build-authority">Build authority/credibility</option>
                <option value="improve-systems">Improve systems/operations</option>
                <option value="scale-team">Scale team</option>
              </select>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                ...gradBtn,
                background: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#aaa",
              }}
            >
              ← Back
            </button>
          ) : onCancel ? (
            <button
              onClick={onCancel}
              style={{
                ...gradBtn,
                background: "none",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#aaa",
              }}
            >
              ← Cancel
            </button>
          ) : null}
          {step < totalSteps ? (
            <button onClick={() => setStep(step + 1)} disabled={!canGoNext()} style={gradBtn}>
              Continue →
            </button>
          ) : (
            <button onClick={saveProfile} disabled={!canGoNext() || saving} style={gradBtn}>
              {saving ? "Saving..." : "Complete Setup →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}