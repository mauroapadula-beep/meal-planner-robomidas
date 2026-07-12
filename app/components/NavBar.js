'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const NAV_LINKS = [
  { href: '/',          label: '🏠 Hoy' },
  { href: '/plan',      label: '📅 Plan' },
  { href: '/matrix',   label: '⚙️ Matrix' },
  { href: '/shopping', label: '🛒 Compras' },
  { href: '/stock',    label: '📦 Stock' },
  { href: '/cook',     label: '👩‍🍳 Cocina' },
]

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Hide nav on login page
  if (pathname === '/login') return null

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || null

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: '4px', padding: '0 20px',
      backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', height: '52px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}>
      {/* Logo */}
      <span style={{ fontSize: '20px', marginRight: '8px' }}>🍽️</span>

      {/* Nav links */}
      {NAV_LINKS.map(({ href, label }) => {
        const isActive = pathname === href
        return (
          <Link key={href} href={href} style={{
            padding: '6px 12px', borderRadius: '7px', textDecoration: 'none', fontSize: '13px',
            fontWeight: isActive ? 'bold' : 'normal',
            backgroundColor: isActive ? '#eff6ff' : 'transparent',
            color: isActive ? '#1d4ed8' : '#475569',
            transition: 'all 0.1s'
          }}>{label}</Link>
        )
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User info + sign out */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            👤 <strong style={{ color: '#0f172a' }}>{userName}</strong>
          </span>
          <button
            onClick={handleSignOut}
            style={{
              padding: '5px 12px', borderRadius: '7px', border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: '12px',
              fontWeight: 'bold'
            }}
          >Salir →</button>
        </div>
      )}
    </nav>
  )
}
