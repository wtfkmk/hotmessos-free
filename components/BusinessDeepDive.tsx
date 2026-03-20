"use client";

import React, { useState, useEffect } from 'react';
import { loadBusinessProgress } from '@/lib/resumeLogic';
import { supabase } from '@/lib/supabase';

interface BusinessDeepDiveProps {
  userId: string;
  diagnosticId?: string | null;
  onComplete: (data: BusinessDeepDiveData) => void;
  onBack?: () => void;
  onSaveAndExit: () => void;
}

interface BusinessDeepDiveData {
  clientJourneyDiscovery: string;
  clientJourneySuccess: string;
  clientJourneyFollowUp: string;
  onlineProfiles: Array<{ platform: string; url: string; intention: string; performance: string }>;
  topProducts: string;
  contentSamples: Array<{ name: string; url: string; file?: File | null; fileName?: string; file_url?: string }>;
  competitors: Array<{ url: string }>;
  competitorAnalysis: string;
  gapAnalysis: string;
  audienceSearchTerms: Array<{ search: string; need: string; help: string }>;
  inboundInquiries: string;
  customerAcquisitionCost: string;
  uniqueValue: string;
  revenueDiversification: string;
  openTextA: string;
  openTextB: string;
}

export default function BusinessDeepDive({
  userId,
  diagnosticId,
  onComplete,
  onBack,
  onSaveAndExit
}: BusinessDeepDiveProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Form state - 15 questions
  const [formData, setFormData] = useState<BusinessDeepDiveData>({
    clientJourneyDiscovery: '',
    clientJourneySuccess: '',
    clientJourneyFollowUp: '',
    onlineProfiles: [{ platform: 'Website homepage', url: '', intention: '', performance: '' }],
    topProducts: '',
    contentSamples: [
      { name: '', url: '', file: null, fileName: '', file_url: '' },
      { name: '', url: '', file: null, fileName: '', file_url: '' },
      { name: '', url: '', file: null, fileName: '', file_url: '' }
    ],
    competitors: [{ url: '' }],
    competitorAnalysis: '',
    gapAnalysis: '',
    audienceSearchTerms: [{ search: '', need: '', help: '' }],
    inboundInquiries: '',
    customerAcquisitionCost: '',
    uniqueValue: '',
    revenueDiversification: '',
    openTextA: '',
    openTextB: ''
  });

  const totalSteps = 5;

  // Load existing progress on mount
  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    if (!userId) return;

    try {
      const progress = await loadBusinessProgress(userId, diagnosticId);
      if (progress && progress.data && Object.keys(progress.data).length > 0) {
        console.log('✅ Loading existing business deep dive data');
        setFormData(prev => ({ ...prev, ...progress.data }));
        if (progress.step > 0) {
          setStep(progress.step);
        }
      }
    } catch (error) {
      console.error('Error loading business progress:', error);
    }
  };

  // Styles matching design system
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#ffffff',
    fontFamily: '"DM Mono", monospace',
    position: 'relative',
    overflow: 'hidden'
  };

  const grainStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.03,
    pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    zIndex: 1
  };

  const glowStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(68,170,255,0.15) 0%, rgba(68,255,136,0.1) 50%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 0,
    filter: 'blur(60px)'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    maxWidth: '900px',
    margin: '0 auto',
    padding: '60px 20px'
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden'
  };

  const gradientBorderStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    padding: '3px',
    background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#0a0a0a',
    marginBottom: '8px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontFamily: '"DM Mono", monospace',
    outline: 'none',
    background: '#ffffff',
    color: '#0a0a0a'
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical' as const
  };

  const buttonStyle: React.CSSProperties = {
    padding: '14px 32px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: '"DM Mono", monospace',
    transition: 'all 0.2s',
    background: 'linear-gradient(135deg, #FF8C42 0%, #FF4ECD 100%)',
    color: '#ffffff'
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'transparent',
    border: '2px solid #e0e0e0',
    color: '#0a0a0a'
  };

  const saveExitButtonStyle: React.CSSProperties = {
    position: 'absolute' as const,
    top: '24px',
    right: '24px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: 600,
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    background: 'transparent',
    color: '#0a0a0a',
    cursor: 'pointer',
    fontFamily: '"DM Mono", monospace',
    transition: 'all 0.2s',
    zIndex: 10
  };

  const errorStyle: React.CSSProperties = {
    color: '#ff4444',
    fontSize: '12px',
    marginTop: '4px'
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.clientJourneyDiscovery.trim()) newErrors.clientJourneyDiscovery = 'Required';
      if (!formData.clientJourneySuccess.trim()) newErrors.clientJourneySuccess = 'Required';
      if (!formData.clientJourneyFollowUp.trim()) newErrors.clientJourneyFollowUp = 'Required';
      const hasProfiles = formData.onlineProfiles.some(p => p.platform.trim() || p.url.trim());
      if (!hasProfiles) newErrors.onlineProfiles = 'Add at least one profile';
      if (!formData.topProducts.trim()) newErrors.topProducts = 'Required';
    }

    if (step === 2) {
      // Content samples are optional
    }

    if (step === 3) {
      const hasCompetitors = formData.competitors.some(c => c.url.trim());
      if (!hasCompetitors) newErrors.competitors = 'Add at least one competitor URL';
      if (!formData.competitorAnalysis.trim()) newErrors.competitorAnalysis = 'Required';
      if (!formData.gapAnalysis.trim()) newErrors.gapAnalysis = 'Required';
    }

    if (step === 4) {
      const hasSearchTerms = formData.audienceSearchTerms.some(
        row => row.search.trim() || row.need.trim() || row.help.trim()
      );
      if (!hasSearchTerms) newErrors.audienceSearchTerms = 'Add at least one search term';
      if (!formData.uniqueValue.trim()) newErrors.uniqueValue = 'Required';
    }

    if (step === 5) {
      if (!formData.revenueDiversification) newErrors.revenueDiversification = 'Required';
      if (!formData.openTextB.trim()) newErrors.openTextB = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onBack) {
      onBack();
    }
  };

  const getAuthHeader = async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const authHeader = await getAuthHeader();
      const response = await fetch('/api/diagnostic/save-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          businessDeepDive: formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save business deep dive');
      }

      onComplete(formData);
    } catch (error) {
      console.error('Error submitting business deep dive:', error);
      setErrors({ submit: 'Failed to save. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    const authHeader = await getAuthHeader();
    await fetch('/api/diagnostic/save-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        businessDeepDive: formData
      })
    });
    onSaveAndExit();
  };

  // Profile management
  const addProfile = () => {
    setFormData({
      ...formData,
      onlineProfiles: [...formData.onlineProfiles, { platform: '', url: '', intention: '', performance: '' }]
    });
  };

  const updateProfile = (index: number, field: 'platform' | 'url' | 'intention' | 'performance', value: string) => {
    const updated = [...formData.onlineProfiles];
    updated[index][field] = value;
    setFormData({ ...formData, onlineProfiles: updated });
  };

  const removeProfile = (index: number) => {
    const updated = formData.onlineProfiles.filter((_, i) => i !== index);
    setFormData({ ...formData, onlineProfiles: updated });
  };

  // Competitor management
  const addCompetitor = () => {
    if (formData.competitors.length < 5) {
      setFormData({
        ...formData,
        competitors: [...formData.competitors, { url: '' }]
      });
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...formData.competitors];
    updated[index].url = value;
    setFormData({ ...formData, competitors: updated });
  };

  const removeCompetitor = (index: number) => {
    const updated = formData.competitors.filter((_, i) => i !== index);
    setFormData({ ...formData, competitors: updated });
  };

  // Search term management
  const addSearchTermRow = () => {
    setFormData({
      ...formData,
      audienceSearchTerms: [...formData.audienceSearchTerms, { search: '', need: '', help: '' }]
    });
  };

  const updateSearchTerm = (index: number, field: 'search' | 'need' | 'help', value: string) => {
    const updated = [...formData.audienceSearchTerms];
    updated[index][field] = value;
    setFormData({ ...formData, audienceSearchTerms: updated });
  };

  const removeSearchTerm = (index: number) => {
    const updated = formData.audienceSearchTerms.filter((_, i) => i !== index);
    setFormData({ ...formData, audienceSearchTerms: updated });
  };

  // Content sample management
  const addContentSample = () => {
    setFormData({
      ...formData,
      contentSamples: [...formData.contentSamples, { name: '', url: '', file: null, fileName: '' }]
    });
  };

  const updateContentSample = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...formData.contentSamples];
    updated[index][field] = value;
    setFormData({ ...formData, contentSamples: updated });
  };

  const updateContentSampleFile = async (index: number, file: File | null) => {
    const updated = [...formData.contentSamples];
    updated[index].file = file;
    updated[index].fileName = file?.name || '';
    updated[index].file_url = '';
    setFormData({ ...formData, contentSamples: updated });

    if (!file) return;

    setUploadingIndex(index);
    try {
      const authHeader = await getAuthHeader();
      const uploadForm = new FormData();
      uploadForm.append(`contentSample0`, file);

      const response = await fetch('/api/diagnostic/upload-files', {
        method: 'POST',
        headers: authHeader,
        body: uploadForm
      });

      if (response.ok) {
        const result = await response.json();
        if (result.files && result.files.length > 0) {
          setFormData(prev => ({
            ...prev,
            contentSamples: prev.contentSamples.map((s, i) =>
              i === index ? { ...s, file_url: result.files[0].fileUrl, fileName: file.name } : s
            )
          }));
        }
      } else {
        console.error('File upload failed:', await response.text());
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeContentSample = (index: number) => {
    const updated = formData.contentSamples.filter((_, i) => i !== index);
    setFormData({ ...formData, contentSamples: updated });
  };

  return (
    <div style={pageStyle}>
      <div style={grainStyle} />
      <div style={glowStyle} />
      
      <div style={contentStyle}>
        <div style={cardStyle}>
          <div style={gradientBorderStyle} />
          
          {/* Save & Exit Button */}
          <button
            onClick={handleSaveAndExit}
            style={saveExitButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#44AAFF';
              e.currentTarget.style.color = '#44AAFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0';
              e.currentTarget.style.color = '#0a0a0a';
            }}
          >
            Save & Return to Home
          </button>

          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '12px',
              color: '#0a0a0a',
              lineHeight: 1.2
            }}>
              Business Deep Dive
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '24px'
            }}>
              Step {step} of {totalSteps}: {
                step === 1 ? 'Client Journey & Products' :
                step === 2 ? 'Website & Content' :
                step === 3 ? 'Competitive Landscape' :
                step === 4 ? 'Audience & Value' :
                'Vision & Strategy'
              }
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f0f0f0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
                width: `${(step / totalSteps) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* STEP 1: Client Journey & Products */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q1a: How clients find you */}
              <div>
                <label style={labelStyle}>
                  How do clients first find your company?
                </label>
                <textarea
                  value={formData.clientJourneyDiscovery}
                  onChange={(e) => setFormData({ ...formData, clientJourneyDiscovery: e.target.value })}
                  placeholder="Describe how potential clients discover you..."
                  style={textareaStyle}
                />
                {errors.clientJourneyDiscovery && <div style={errorStyle}>{errors.clientJourneyDiscovery}</div>}
              </div>

              {/* Q1b: What makes a sale/engagement successful */}
              <div>
                <label style={labelStyle}>
                  What makes a sale or engagement successful?
                </label>
                <textarea
                  value={formData.clientJourneySuccess}
                  onChange={(e) => setFormData({ ...formData, clientJourneySuccess: e.target.value })}
                  placeholder="When/how do they pay you? What defines success?"
                  style={textareaStyle}
                />
                {errors.clientJourneySuccess && <div style={errorStyle}>{errors.clientJourneySuccess}</div>}
              </div>

              {/* Q1c: Follow-up after engagement */}
              <div>
                <label style={labelStyle}>
                  How do you follow up with clients after your engagement ends?
                </label>
                <textarea
                  value={formData.clientJourneyFollowUp}
                  onChange={(e) => setFormData({ ...formData, clientJourneyFollowUp: e.target.value })}
                  placeholder="Describe your post-engagement relationship..."
                  style={textareaStyle}
                />
                {errors.clientJourneyFollowUp && <div style={errorStyle}>{errors.clientJourneyFollowUp}</div>}
              </div>

              {/* Q2: All Online Profiles (including Website homepage) */}
              <div>
                <label style={labelStyle}>
                  List all online profiles (including website homepage)
                </label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  Add each platform with URL, your intention, and performance thoughts
                </p>
                {formData.onlineProfiles.map((profile, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        type="text"
                        value={profile.platform}
                        onChange={(e) => updateProfile(index, 'platform', e.target.value)}
                        placeholder={index === 0 ? "Website homepage" : "Platform name (e.g., Instagram, LinkedIn)"}
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={profile.url}
                        onChange={(e) => updateProfile(index, 'url', e.target.value)}
                        placeholder="URL or @handle"
                        style={inputStyle}
                      />
                      <input
                        type="text"
                        value={profile.intention}
                        onChange={(e) => updateProfile(index, 'intention', e.target.value)}
                        placeholder="Your intention for this platform"
                        style={inputStyle}
                      />
                      <textarea
                        value={profile.performance}
                        onChange={(e) => updateProfile(index, 'performance', e.target.value)}
                        placeholder="Performance thoughts (followers, engagement, what's working/not)"
                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                      />
                      {formData.onlineProfiles.length > 1 && (
                        <button
                          onClick={() => removeProfile(index)}
                          style={{
                            padding: '8px 16px',
                            background: '#ffebee',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#c62828',
                            alignSelf: 'flex-start'
                          }}
                        >
                          Remove Profile
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addProfile}
                  style={{
                    ...secondaryButtonStyle,
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  + Add Another Profile
                </button>
                {errors.onlineProfiles && <div style={errorStyle}>{errors.onlineProfiles}</div>}
              </div>

              {/* Q3: Top 5 Products/Services */}
              <div>
                <label style={labelStyle}>
                  What are your top 5 products or services offered?
                </label>
                <textarea
                  value={formData.topProducts}
                  onChange={(e) => setFormData({ ...formData, topProducts: e.target.value })}
                  placeholder="List your main offerings..."
                  style={textareaStyle}
                />
                {errors.topProducts && <div style={errorStyle}>{errors.topProducts}</div>}
              </div>
            </div>
          )}

          {/* STEP 2: Content Samples */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q5: Content Samples (3 fixed slots) */}
              <div>
                <label style={labelStyle}>
                  Share 3 content samples (posts, articles, videos, docs)
                </label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  For each sample, add a URL or upload a file — or both
                </p>
                {formData.contentSamples.map((sample, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    background: '#f9f9f9',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#666',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Sample {index + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Content Title */}
                      <input
                        type="text"
                        value={sample.name}
                        onChange={(e) => updateContentSample(index, 'name', e.target.value)}
                        placeholder="Content title or description"
                        style={inputStyle}
                      />

                      {/* URL Input */}
                      <input
                        type="text"
                        value={sample.url}
                        onChange={(e) => updateContentSample(index, 'url', e.target.value)}
                        placeholder="URL (e.g., https://instagram.com/p/...)"
                        style={inputStyle}
                      />

                      {/* OR divider */}
                      <div style={{
                        textAlign: 'center',
                        color: '#999',
                        fontSize: '13px',
                        margin: '4px 0'
                      }}>
                        — OR upload a file —
                      </div>

                      {/* File Upload */}
                      <div>
                        <label style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          background: uploadingIndex === index
                            ? '#e0e0e0'
                            : 'linear-gradient(135deg, #44AAFF 0%, #44FF88 100%)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          fontFamily: '"DM Mono", monospace',
                          color: uploadingIndex === index ? '#999' : '#0a0a0a',
                          cursor: uploadingIndex === index ? 'wait' : 'pointer',
                          userSelect: 'none'
                        }}>
                          ↑ Choose File
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.txt"
                            disabled={uploadingIndex === index}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              updateContentSampleFile(index, file);
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                          PDF, JPG, PNG, WEBP, DOCX, TXT
                        </div>

                        {/* Uploading state */}
                        {uploadingIndex === index && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#44AAFF',
                            padding: '8px 12px',
                            background: '#f0f9ff',
                            borderRadius: '6px',
                            border: '1px solid #44AAFF'
                          }}>
                            Uploading…
                          </div>
                        )}

                        {/* Upload success */}
                        {sample.file_url && uploadingIndex !== index && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#2e7d32',
                            padding: '8px 12px',
                            background: '#f1f8e9',
                            borderRadius: '6px',
                            border: '1px solid #a5d6a7',
                            wordBreak: 'break-all'
                          }}>
                            ✓ Uploaded: {sample.fileName}
                          </div>
                        )}

                        {/* File selected but no URL yet (edge case) */}
                        {sample.fileName && !sample.file_url && uploadingIndex !== index && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '13px',
                            color: '#666',
                            padding: '8px 12px',
                            background: '#e3f2fd',
                            borderRadius: '6px'
                          }}>
                            📎 {sample.fileName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Allow adding up to 5 total */}
                {formData.contentSamples.length < 5 && (
                  <button
                    onClick={addContentSample}
                    style={{
                      ...secondaryButtonStyle,
                      width: '100%',
                      marginTop: '8px'
                    }}
                  >
                    + Add Another Sample (up to 5)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Competitive Landscape */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q6: Competitors (up to 5 URLs) */}
              <div>
                <label style={labelStyle}>
                  List 3-5 competitor URLs
                </label>
                {formData.competitors.map((competitor, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <input
                      type="text"
                      value={competitor.url}
                      onChange={(e) => updateCompetitor(index, e.target.value)}
                      placeholder="https://competitor.com"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    {formData.competitors.length > 1 && (
                      <button
                        onClick={() => removeCompetitor(index)}
                        style={{
                          padding: '8px 16px',
                          background: '#ffebee',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          color: '#c62828'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {formData.competitors.length < 5 && (
                  <button
                    onClick={addCompetitor}
                    style={{
                      ...secondaryButtonStyle,
                      width: '100%',
                      marginTop: '8px'
                    }}
                  >
                    + Add Competitor (up to 5)
                  </button>
                )}
                {errors.competitors && <div style={errorStyle}>{errors.competitors}</div>}
              </div>

              {/* Q7: Competitor Analysis */}
              <div>
                <label style={labelStyle}>
                  What do you like/dislike about their online presence?
                </label>
                <textarea
                  value={formData.competitorAnalysis}
                  onChange={(e) => setFormData({ ...formData, competitorAnalysis: e.target.value })}
                  placeholder="What are they doing well? What could be better?"
                  style={textareaStyle}
                />
                {errors.competitorAnalysis && <div style={errorStyle}>{errors.competitorAnalysis}</div>}
              </div>

              {/* Q8: Gap Analysis */}
              <div>
                <label style={labelStyle}>
                  Do you know of any gaps between what you offer and what people perceive?
                </label>
                <textarea
                  value={formData.gapAnalysis}
                  onChange={(e) => setFormData({ ...formData, gapAnalysis: e.target.value })}
                  placeholder="Are there misunderstandings about your business or offerings?"
                  style={textareaStyle}
                />
                {errors.gapAnalysis && <div style={errorStyle}>{errors.gapAnalysis}</div>}
              </div>
            </div>
          )}

          {/* STEP 4: Audience & Value */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q9: Audience Search Terms Table */}
              <div>
                <label style={labelStyle}>
                  Audience Search Terms: What They Search | What They Need | How You Help
                </label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                  Help us understand how your audience finds and needs you
                </p>
                
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '12px',
                  marginBottom: '8px',
                  padding: '8px 12px',
                  background: '#f0f0f0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#666'
                }}>
                  <div>What They Search</div>
                  <div>What They Need</div>
                  <div>How You Help</div>
                </div>

                {/* Table Rows */}
                {formData.audienceSearchTerms.map((row, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '12px',
                    marginBottom: '12px',
                    padding: '12px',
                    background: '#f9f9f9',
                    borderRadius: '8px'
                  }}>
                    <input
                      type="text"
                      value={row.search}
                      onChange={(e) => updateSearchTerm(index, 'search', e.target.value)}
                      placeholder="e.g., 'how to scale a coaching business'"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      value={row.need}
                      onChange={(e) => updateSearchTerm(index, 'need', e.target.value)}
                      placeholder="e.g., 'more clients without burnout'"
                      style={inputStyle}
                    />
                    <input
                      type="text"
                      value={row.help}
                      onChange={(e) => updateSearchTerm(index, 'help', e.target.value)}
                      placeholder="e.g., 'automated client onboarding system'"
                      style={inputStyle}
                    />
                    {formData.audienceSearchTerms.length > 1 && (
                      <button
                        onClick={() => removeSearchTerm(index)}
                        style={{
                          padding: '8px',
                          background: '#ffebee',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          color: '#c62828',
                          lineHeight: 1,
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSearchTermRow}
                  style={{
                    ...secondaryButtonStyle,
                    width: '100%',
                    marginTop: '8px'
                  }}
                >
                  + Add Row
                </button>
                {errors.audienceSearchTerms && <div style={errorStyle}>{errors.audienceSearchTerms}</div>}
              </div>

              {/* Q10: Inbound Inquiries */}
              <div>
                <label style={labelStyle}>
                  How many inbound sales inquiries do you get monthly, from where, and how many convert?
                </label>
                <textarea
                  value={formData.inboundInquiries}
                  onChange={(e) => setFormData({ ...formData, inboundInquiries: e.target.value })}
                  placeholder="e.g., 20-30 inquiries/month from Instagram DMs, ~10% convert to paid clients..."
                  style={textareaStyle}
                />
              </div>

              {/* Q11: Customer Acquisition Cost (Optional) */}
              <div>
                <label style={labelStyle}>
                  What's your customer acquisition cost? (If known - optional)
                </label>
                <input
                  type="text"
                  value={formData.customerAcquisitionCost}
                  onChange={(e) => setFormData({ ...formData, customerAcquisitionCost: e.target.value })}
                  placeholder="e.g., $50 per customer, or 'Not sure'"
                  style={inputStyle}
                />
              </div>

              {/* Q12: Unique Value */}
              <div>
                <label style={labelStyle}>
                  What is the most important/unique thing clients should know about working with you?
                </label>
                <textarea
                  value={formData.uniqueValue}
                  onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })}
                  placeholder="What makes you different?"
                  style={textareaStyle}
                />
                {errors.uniqueValue && <div style={errorStyle}>{errors.uniqueValue}</div>}
              </div>
            </div>
          )}

          {/* STEP 5: Vision & Strategy */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Q13: Revenue Diversification */}
              <div>
                <label style={labelStyle}>
                  My current revenue comes from…
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { value: 'one-source', label: 'A) One primary source (all eggs in one basket)' },
                    { value: '1-2-sources', label: 'B) 1-2 sources (some diversification)' },
                    { value: '3-5-streams', label: 'C) 3-5 revenue streams' },
                    { value: 'multiple-intentional', label: 'D) Multiple streams, intentionally designed' }
                  ].map(option => (
                    <label
                      key={option.value}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        border: '2px solid',
                        borderColor: formData.revenueDiversification === option.value ? '#44AAFF' : '#e0e0e0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s',
                        background: formData.revenueDiversification === option.value ? '#f0f9ff' : '#ffffff',
                        color: '#0a0a0a'
                      }}
                    >
                      <input
                        type="radio"
                        name="revenueDiversification"
                        value={option.value}
                        checked={formData.revenueDiversification === option.value}
                        onChange={(e) => setFormData({ ...formData, revenueDiversification: e.target.value })}
                        style={{ cursor: 'pointer' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.revenueDiversification && <div style={errorStyle}>{errors.revenueDiversification}</div>}
              </div>

              {/* Q15a: Open Text A (Optional) */}
              <div>
                <label style={labelStyle}>
                  Is there anything else you want us to know about you, your business, or your journey that we haven't asked?
                </label>
                <textarea
                  value={formData.openTextA}
                  onChange={(e) => setFormData({ ...formData, openTextA: e.target.value })}
                  placeholder="Optional - anything we missed?"
                  style={textareaStyle}
                />
              </div>

              {/* Q15b: Open Text B (REQUIRED) */}
              <div>
                <label style={labelStyle}>
                  What's the version of yourself and your business you're trying to build toward?
                </label>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  No filters, no "realistic" limits — just the truth.
                </p>
                <textarea
                  value={formData.openTextB}
                  onChange={(e) => setFormData({ ...formData, openTextB: e.target.value })}
                  placeholder="Paint the picture of where you're headed..."
                  style={textareaStyle}
                />
                {errors.openTextB && <div style={errorStyle}>{errors.openTextB}</div>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', gap: '16px' }}>
            <button
              onClick={handleBack}
              style={secondaryButtonStyle}
              disabled={isSubmitting}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              style={buttonStyle}
              disabled={isSubmitting}
            >
              {step < totalSteps ? 'Continue →' : isSubmitting ? 'Saving...' : 'Complete Business Deep Dive'}
            </button>
          </div>

          {errors.submit && (
            <div style={{ ...errorStyle, textAlign: 'center', marginTop: '16px' }}>
              {errors.submit}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}