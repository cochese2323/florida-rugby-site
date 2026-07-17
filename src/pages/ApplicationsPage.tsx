import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type Status = 'pending' | 'approved' | 'declined'

interface Application {
  id: string
  full_name: string
  email: string
  phone: string | null
  business_name: string | null
  business_category: string | null
  city: string | null
  supported_club: string
  message: string | null
  status: Status
  created_at: string
}

const STATUS_TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'declined', label: 'Declined' },
  { key: 'all', label: 'All' },
]

export default function ApplicationsPage() {
  const { signOut } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<Status | 'all'>('pending')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [selected, setSelected] = useState<Application | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchApplications()
  }, [filter])

  async function fetchApplications() {
    setLoading(true)
    let query = supabase
      .from('membership_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') query = query.eq('status', filter)

    const { data, error } = await query
    if (!error && data) setApplications(data as Application[])
    setLoading(false)
    fetchCounts()
  }

  async function fetchCounts() {
    const { data } = await supabase
      .from('membership_applications')
      .select('status')

    if (data) {
      const c: Record<string, number> = { pending: 0, approved: 0, declined: 0, all: data.length }
      for (const row of data) c[row.status] = (c[row.status] ?? 0) + 1
      setCounts(c)
    }
  }

  async function updateStatus(id: string, status: Status) {
    setUpdating(id)
    const { error } = await supabase
      .from('membership_applications')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setApplications(prev => prev.filter(a => a.id !== id))
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
      fetchCounts()
    }
    setUpdating(null)
  }

  const filtered = applications

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.sidebarLogo}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.15" />
              <ellipse cx="20" cy="20" rx="8" ry="13" stroke="white" strokeWidth="2" fill="none" />
              <line x1="8" y1="20" x2="32" y2="20" stroke="white" strokeWidth="2" />
            </svg>
            <span style={styles.sidebarTitle}>Rugby Admin</span>
          </div>
        </div>

        <nav style={styles.nav}>
          <div style={styles.navItem}>
            <span style={{ ...styles.navIcon, background: 'rgba(255,255,255,0.15)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </span>
            Applications
            {counts['pending'] > 0 && (
              <span style={styles.badge}>{counts['pending']}</span>
            )}
          </div>
        </nav>

        <button onClick={signOut} style={styles.signOutBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <header style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Membership Applications</h1>
            <p style={styles.pageSubtitle}>Review and manage membership applications</p>
          </div>
        </header>

        {/* Tabs */}
        <div style={styles.tabs}>
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setFilter(tab.key); setSelected(null) }}
              style={filter === tab.key ? { ...styles.tab, ...styles.tabActive } : styles.tab}
            >
              {tab.label}
              {counts[tab.key] !== undefined && (
                <span style={filter === tab.key ? { ...styles.tabCount, ...styles.tabCountActive } : styles.tabCount}>
                  {counts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {/* List */}
          <div style={selected ? styles.listNarrow : styles.listFull}>
            {loading ? (
              <div style={styles.empty}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={styles.empty}>No {filter === 'all' ? '' : filter} applications</div>
            ) : (
              filtered.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelected(app)}
                  style={selected?.id === app.id ? { ...styles.appCard, ...styles.appCardSelected } : styles.appCard}
                >
                  <div style={styles.appCardTop}>
                    <div>
                      <div style={styles.appName}>{app.full_name}</div>
                      <div style={styles.appEmail}>{app.email}</div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  {app.business_name && (
                    <div style={styles.appMeta}>{app.business_name} &middot; {app.business_category}</div>
                  )}
                  {app.city && <div style={styles.appMeta}>{app.city}</div>}
                  <div style={styles.appDate}>{formatDate(app.created_at)}</div>
                </div>
              ))
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={styles.detail}>
              <div style={styles.detailHeader}>
                <button onClick={() => setSelected(null)} style={styles.closeBtn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
                <StatusBadge status={selected.status} />
              </div>

              <h2 style={styles.detailName}>{selected.full_name}</h2>

              <div style={styles.detailFields}>
                <DetailField label="Email" value={selected.email} />
                {selected.phone && <DetailField label="Phone" value={selected.phone} />}
                {selected.business_name && <DetailField label="Business" value={selected.business_name} />}
                {selected.business_category && <DetailField label="Category" value={selected.business_category} />}
                {selected.city && <DetailField label="City" value={selected.city} />}
                <DetailField label="Supported Club" value={selected.supported_club} />
                <DetailField label="Submitted" value={formatDate(selected.created_at)} />
                {selected.message && (
                  <div style={styles.detailField}>
                    <div style={styles.detailLabel}>Message</div>
                    <div style={styles.detailMessage}>{selected.message}</div>
                  </div>
                )}
              </div>

              {selected.status === 'pending' && (
                <div style={styles.actions}>
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={updating === selected.id}
                    style={styles.approveBtn}
                  >
                    {updating === selected.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, 'declined')}
                    disabled={updating === selected.id}
                    style={styles.declineBtn}
                  >
                    {updating === selected.id ? 'Updating...' : 'Decline'}
                  </button>
                </div>
              )}

              {selected.status === 'approved' && (
                <div style={styles.actions}>
                  <button
                    onClick={() => updateStatus(selected.id, 'declined')}
                    disabled={updating === selected.id}
                    style={styles.declineBtn}
                  >
                    Revoke Approval
                  </button>
                </div>
              )}

              {selected.status === 'declined' && (
                <div style={styles.actions}>
                  <button
                    onClick={() => updateStatus(selected.id, 'approved')}
                    disabled={updating === selected.id}
                    style={styles.approveBtn}
                  >
                    Approve Instead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, React.CSSProperties> = {
    pending: { background: '#fef3c7', color: '#92400e' },
    approved: { background: '#d1fae5', color: '#065f46' },
    declined: { background: '#fee2e2', color: '#991b1b' },
  }
  return (
    <span style={{ ...styles.statusBadge, ...map[status] }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailField}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sidebar: {
    width: '220px',
    background: '#0f2133',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  sidebarLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sidebarTitle: {
    fontWeight: 700,
    fontSize: '16px',
    letterSpacing: '-0.3px',
  },
  nav: {
    padding: '16px 12px',
    flex: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'default',
  },
  navIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  badge: {
    marginLeft: 'auto',
    background: '#e53e3e',
    color: 'white',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 700,
    padding: '1px 7px',
    minWidth: '20px',
    textAlign: 'center',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '0 12px 20px',
    padding: '10px 12px',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: '#f8fafc',
    overflow: 'hidden',
  },
  pageHeader: {
    padding: '28px 32px 0',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  pageTitle: {
    margin: '0 0 4px',
    fontSize: '22px',
    fontWeight: 700,
    color: '#0f2133',
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    padding: '20px 32px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tabActive: {
    color: '#0f2133',
    borderBottomColor: '#0f2133',
  },
  tabCount: {
    background: '#e5e7eb',
    color: '#6b7280',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    padding: '1px 7px',
  },
  tabCountActive: {
    background: '#0f2133',
    color: 'white',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  listFull: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  listNarrow: {
    width: '340px',
    flexShrink: 0,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    borderRight: '1px solid #e5e7eb',
  },
  appCard: {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  appCardSelected: {
    borderColor: '#0f2133',
    boxShadow: '0 0 0 2px rgba(15,33,51,0.12)',
  },
  appCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '6px',
  },
  appName: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#111827',
    marginBottom: '2px',
  },
  appEmail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  appMeta: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  appDate: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '8px',
  },
  statusBadge: {
    padding: '2px 9px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  empty: {
    color: '#9ca3af',
    fontSize: '14px',
    textAlign: 'center',
    paddingTop: '48px',
  },
  detail: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 32px',
    background: 'white',
  },
  detailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#6b7280',
  },
  detailName: {
    margin: '0 0 20px',
    fontSize: '20px',
    fontWeight: 700,
    color: '#111827',
  },
  detailFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '28px',
  },
  detailField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  detailLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '14px',
    color: '#111827',
  },
  detailMessage: {
    fontSize: '14px',
    color: '#374151',
    lineHeight: '1.6',
    background: '#f9fafb',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  approveBtn: {
    flex: 1,
    padding: '10px',
    background: '#065f46',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  declineBtn: {
    flex: 1,
    padding: '10px',
    background: 'white',
    color: '#dc2626',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
