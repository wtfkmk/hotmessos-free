"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h1>Reset Your Password</h1>
      
      {success ? (
        <div style={{ color: 'green' }}>
          Password updated! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleReset}>
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          
          <input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          
          <button type="submit" style={{ padding: '10px 20px' }}>
            Reset Password
          </button>
        </form>
      )}
    </div>
  )
}