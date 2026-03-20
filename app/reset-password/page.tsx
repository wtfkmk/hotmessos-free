"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false) // true once recovery session is established

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Supabase PKCE flow: the email link contains ?code=XXX&type=recovery.
    // The browser client automatically exchanges the code for a session when
    // detectSessionInUrl is true (default). We listen for PASSWORD_RECOVERY to
    // know the session is established and the form can be shown.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    // Also check if a session already exists (e.g. page refresh after exchange)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    color: '#ffffff',
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '12px 14px',
    marginBottom: '12px',
    background: '#1a1a1a',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '15px',
    boxSizing: 'border-box',
  }

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #44AAFF, #44FF88)',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '4px',
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 700 }}>Reset Your Password</h1>

        {success ? (
          <p style={{ color: '#44FF88', marginTop: '16px' }}>
            Password updated! Redirecting...
          </p>
        ) : !ready ? (
          <div>
            <p style={{ color: '#aaa', marginTop: '16px', lineHeight: 1.6 }}>
              Verifying your reset link...
            </p>
            <p style={{ color: '#666', fontSize: '13px', marginTop: '8px' }}>
              If nothing happens, your link may have expired. Request a new one from the login page.
            </p>
            <button
              onClick={() => { window.location.href = '/' }}
              style={{ ...buttonStyle, marginTop: '20px', background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ marginTop: '20px' }}>
            {error && (
              <div style={{
                color: '#ff6b6b',
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '14px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <input
              type="password"
              placeholder="New password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={buttonStyle}>
              Set New Password
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
