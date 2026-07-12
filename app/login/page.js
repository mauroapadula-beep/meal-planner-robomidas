'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [isLocalhost, setIsLocalhost] = useState(false)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (window.location.hostname === 'localhost') {
      setIsLocalhost(true)
      router.replace('/')
    }
  }, [])

  if (isLocalhost) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/')
      router.refresh()
    } else {
      if (!displayName.trim()) { setError('Por favor ingresá tu nombre.'); setLoading(false); return }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: displayName.trim() } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccessMsg('¡Cuenta creada! Revisá tu email para confirmarla, luego iniciá sesión.')
      setMode('login')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#f8fafc', fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '48px 40px', width: '100%', maxWidth: '400px'
      }}>
        {/* Logo / header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>Meal Planner</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Robomidas · Sistema de planificación</p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '9px', padding: '3px', marginBottom: '24px' }}>
          {[['login', 'Iniciar sesión'], ['signup', 'Crear cuenta']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccessMsg('') }}
              style={{
                flex: 1, padding: '8px', borderRadius: '7px', border: 'none',
                backgroundColor: mode === m ? '#fff' : 'transparent',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                fontWeight: mode === m ? 'bold' : 'normal',
                color: mode === m ? '#0f172a' : '#64748b',
                cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s'
              }}>{label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>NOMBRE</label>
              <input
                type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre (ej. Mauro)"
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>
          )}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '5px' }}>CONTRASEÑA</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626' }}>
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#16a34a' }}>
              ✅ {successMsg}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              padding: '12px', borderRadius: '9px', border: 'none',
              backgroundColor: loading ? '#94a3b8' : '#0f172a',
              color: '#fff', fontWeight: 'bold', fontSize: '14px',
              cursor: loading ? 'default' : 'pointer', marginTop: '4px'
            }}
          >
            {loading ? '⏳ Procesando...' : mode === 'login' ? '→ Entrar' : '→ Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
