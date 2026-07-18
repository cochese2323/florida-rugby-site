import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { navigate } from '../lib/router'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill="#1a3a5c" />
            <ellipse cx="20" cy="20" rx="8" ry="13" stroke="white" strokeWidth="2" fill="none" />
            <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeWidth="2" />
          </svg>
        </div>
        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Rugby Membership Management</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@example.com"
              required
              autoFocus
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button onClick={() => navigate('')} style={styles.homeLink}>
          ← Back to Homepage
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f2133 0%, #1a3a5c 100%)',
    padding: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  logo: {
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    margin: '0 0 4px',
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f2133',
  },
  subtitle: {
    margin: '0 0 32px',
    fontSize: '14px',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    background: '#1a3a5c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  error: {
    margin: 0,
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px',
  },
  homeLink: {
    marginTop: '24px',
    display: 'block',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
}
