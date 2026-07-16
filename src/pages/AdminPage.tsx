import { useState, useEffect, useCallback } from 'react';
import {
  Lock, Users, Mail, Calendar, Trophy, CheckCircle2, XCircle, Clock,
  AlertCircle, Trash2, Plus, Minus, DollarSign, Shield, LogOut, Settings,
  Loader2, Key,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { MembershipApplication, ContactMessage, EventRsvp, ClubFund } from '../lib/types';

type Tab = 'applications' | 'messages' | 'rsvps' | 'funds' | 'settings';

type NewClubForm = { club_name: string; city: string; goal_amount: string };

export function AdminPage() {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('applications');

  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [rsvps, setRsvps] = useState<EventRsvp[]>([]);
  const [funds, setFunds] = useState<ClubFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutationError, setMutationError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(!!sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [appRes, msgRes, rsvpRes, fundRes] = await Promise.all([
      supabase.from('membership_applications').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('event_rsvps').select('*').order('created_at', { ascending: false }),
      supabase.from('club_funds').select('*').order('sort_order', { ascending: true }),
    ]);
    if (appRes.data) setApplications(appRes.data as MembershipApplication[]);
    if (msgRes.data) setMessages(msgRes.data as ContactMessage[]);
    if (rsvpRes.data) setRsvps(rsvpRes.data as EventRsvp[]);
    if (fundRes.data) setFunds(fundRes.data as ClubFund[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setTab('applications');
    setEmail('');
    setPassword('');
  };

  const withMutationGuard = async (fn: () => PromiseLike<{ error: unknown | null }>) => {
    setMutationError('');
    const { error } = await fn();
    if (error) {
      setMutationError('Operation failed. Please refresh and try again.');
      return false;
    }
    return true;
  };

  const updateApplicationStatus = async (id: string, status: 'approved' | 'declined' | 'pending') => {
    const ok = await withMutationGuard(() =>
      supabase.from('membership_applications').update({ status }).eq('id', id)
    );
    if (ok) setApplications(applications.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const deleteMessage = async (id: string) => {
    const ok = await withMutationGuard(() =>
      supabase.from('contact_messages').delete().eq('id', id)
    );
    if (ok) setMessages(messages.filter((m) => m.id !== id));
  };

  const deleteRsvp = async (id: string) => {
    const ok = await withMutationGuard(() =>
      supabase.from('event_rsvps').delete().eq('id', id)
    );
    if (ok) setRsvps(rsvps.filter((r) => r.id !== id));
  };

  const adjustFund = async (id: string, delta: number) => {
    const fund = funds.find((f) => f.id === id);
    if (!fund) return;
    const newAmount = Math.max(0, fund.current_amount + delta);
    const ok = await withMutationGuard(() =>
      supabase.from('club_funds').update({ current_amount: newAmount }).eq('id', id)
    );
    if (ok) setFunds(funds.map((f) => (f.id === id ? { ...f, current_amount: newAmount } : f)));
  };

  const setFundAmount = async (id: string, amount: number) => {
    const ok = await withMutationGuard(() =>
      supabase.from('club_funds').update({ current_amount: amount }).eq('id', id)
    );
    if (ok) setFunds(funds.map((f) => (f.id === id ? { ...f, current_amount: amount } : f)));
  };

  const addClub = async (form: NewClubForm) => {
    const slug = form.club_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const maxSort = funds.reduce((m, f) => Math.max(m, f.sort_order), -1);
    const { data, error } = await supabase
      .from('club_funds')
      .insert({
        club_name: form.club_name.trim(),
        city: form.city.trim(),
        slug,
        goal_amount: Number(form.goal_amount) || 1000,
        current_amount: 0,
        sort_order: maxSort + 1,
      })
      .select()
      .single();
    if (error) {
      setMutationError('Failed to add club. Please try again.');
      return false;
    }
    setFunds([...funds, data as ClubFund]);
    return true;
  };

  const deleteClub = async (id: string) => {
    const ok = await withMutationGuard(() =>
      supabase.from('club_funds').delete().eq('id', id)
    );
    if (ok) setFunds(funds.filter((f) => f.id !== id));
  };

  if (session === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-navy-50 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-navy-50 py-16">
        <div className="card mx-auto max-w-md p-8 shadow-lg">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-navy-900">Admin Portal</h1>
          <p className="mt-2 text-sm text-navy-500">
            Sign in with your admin account to manage the chamber.
          </p>

          {authError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="label-field" htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@floridarugbychamber.com"
                autoFocus
              />
            </div>
            <div>
              <label className="label-field" htmlFor="admin-pass">Password</label>
              <input
                id="admin-pass"
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your admin password"
              />
            </div>
            <button type="submit" disabled={authLoading} className="btn-primary w-full">
              {authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-navy-400">
            Admin access only. To request admin access, contact the chamber administrator.
          </p>
        </div>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  const tabs: { id: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { id: 'applications', label: 'Applications', icon: Users, count: pendingCount },
    { id: 'messages', label: 'Messages', icon: Mail, count: messages.length },
    { id: 'rsvps', label: 'RSVPs', icon: Calendar, count: rsvps.length },
    { id: 'funds', label: 'Club Funds', icon: Trophy, count: funds.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="container-page py-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-teal-600" />
              <h1 className="font-display text-2xl font-bold text-navy-900">Admin Portal</h1>
            </div>
            <p className="mt-1 text-sm text-navy-500">
              Manage chamber operations — applications, messages, RSVPs, and club funds.
            </p>
          </div>
          <button onClick={handleSignOut} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>

        {mutationError && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 px-4 py-3 text-sm text-coral-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {mutationError}
            <button onClick={() => setMutationError('')} className="ml-auto text-coral-500 hover:text-coral-700">
              ✕
            </button>
          </div>
        )}

        <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-white p-1.5 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
                tab === t.id ? 'bg-teal-600 text-white' : 'text-navy-600 hover:bg-navy-100'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  tab === t.id ? 'bg-white/20' : 'bg-coral-100 text-coral-700'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="py-16 text-center text-navy-400">Loading...</div>
          ) : tab === 'applications' ? (
            <ApplicationsTab applications={applications} onUpdateStatus={updateApplicationStatus} />
          ) : tab === 'messages' ? (
            <MessagesTab messages={messages} onDelete={deleteMessage} />
          ) : tab === 'rsvps' ? (
            <RsvpsTab rsvps={rsvps} onDelete={deleteRsvp} />
          ) : tab === 'funds' ? (
            <FundsTab funds={funds} onAdjust={adjustFund} onSet={setFundAmount} onAdd={addClub} onDelete={deleteClub} />
          ) : (
            <SettingsTab />
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    pending: { icon: Clock, class: 'bg-gold-100 text-gold-700', label: 'Pending' },
    approved: { icon: CheckCircle2, class: 'bg-teal-100 text-teal-700', label: 'Approved' },
    declined: { icon: XCircle, class: 'bg-coral-100 text-coral-700', label: 'Declined' },
  };
  const c = config[status as keyof typeof config] || config.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${c.class}`}>
      <c.icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

function ApplicationsTab({
  applications,
  onUpdateStatus,
}: {
  applications: MembershipApplication[];
  onUpdateStatus: (id: string, status: 'approved' | 'declined' | 'pending') => void;
}) {
  if (applications.length === 0) {
    return <EmptyState icon={Users} message="No membership applications yet." />;
  }
  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div key={app.id} className="card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-lg font-bold text-navy-900">{app.full_name}</h3>
                <StatusBadge status={app.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <InfoRow label="Email" value={app.email} />
                <InfoRow label="Phone" value={app.phone || '—'} />
                <InfoRow label="Business" value={app.business_name || '—'} />
                <InfoRow label="Category" value={app.business_category || '—'} />
                <InfoRow label="City" value={app.city || '—'} />
                <InfoRow label="Supported Club" value={app.supported_club} />
              </div>
              {app.message && (
                <div className="mt-3 rounded-lg bg-navy-50 p-3 text-sm text-navy-600">
                  <span className="font-semibold text-navy-700">Message: </span>
                  {app.message}
                </div>
              )}
              <p className="mt-3 text-xs text-navy-400">
                Submitted {new Date(app.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-2 lg:flex-col">
              {app.status !== 'approved' && (
                <button
                  onClick={() => onUpdateStatus(app.id, 'approved')}
                  className="btn bg-teal-600 text-white hover:bg-teal-700 text-xs px-4 py-2"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                </button>
              )}
              {app.status !== 'declined' && (
                <button
                  onClick={() => onUpdateStatus(app.id, 'declined')}
                  className="btn bg-coral-100 text-coral-700 hover:bg-coral-200 text-xs px-4 py-2"
                >
                  <XCircle className="h-3.5 w-3.5" /> Decline
                </button>
              )}
              {app.status !== 'pending' && (
                <button
                  onClick={() => onUpdateStatus(app.id, 'pending')}
                  className="btn bg-navy-100 text-navy-600 hover:bg-navy-200 text-xs px-4 py-2"
                >
                  <Clock className="h-3.5 w-3.5" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesTab({ messages, onDelete }: { messages: ContactMessage[]; onDelete: (id: string) => void }) {
  if (messages.length === 0) return <EmptyState icon={Mail} message="No messages yet." />;
  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold text-navy-900">{msg.subject}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-500">
                <span>From: <span className="font-semibold text-navy-700">{msg.name}</span></span>
                <span>{msg.email}</span>
              </div>
              <p className="mt-3 rounded-lg bg-navy-50 p-3 text-sm text-navy-600">{msg.message}</p>
              <p className="mt-2 text-xs text-navy-400">
                {new Date(msg.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => onDelete(msg.id)}
              className="shrink-0 rounded-lg p-2 text-navy-400 transition-colors hover:bg-coral-50 hover:text-coral-600"
              aria-label="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RsvpsTab({ rsvps, onDelete }: { rsvps: EventRsvp[]; onDelete: (id: string) => void }) {
  if (rsvps.length === 0) return <EmptyState icon={Calendar} message="No RSVPs yet." />;
  const totalGuests = rsvps.reduce((sum, r) => sum + r.guests, 0);
  return (
    <div>
      <div className="mb-4 rounded-xl bg-teal-50 p-4 text-sm text-teal-700">
        <span className="font-bold">{rsvps.length}</span> RSVPs / <span className="font-bold">{totalGuests}</span> total guests
      </div>
      <div className="space-y-4">
        {rsvps.map((rsvp) => (
          <div key={rsvp.id} className="card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-navy-900">{rsvp.name}</h3>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-500">
                  <span>{rsvp.email}</span>
                  <span className="font-semibold text-teal-600">{rsvp.guests} {rsvp.guests === 1 ? 'guest' : 'guests'}</span>
                </div>
                {rsvp.message && (
                  <p className="mt-2 rounded-lg bg-navy-50 p-3 text-sm text-navy-600">{rsvp.message}</p>
                )}
                <p className="mt-2 text-xs text-navy-400">
                  {new Date(rsvp.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => onDelete(rsvp.id)}
                className="shrink-0 rounded-lg p-2 text-navy-400 transition-colors hover:bg-coral-50 hover:text-coral-600"
                aria-label="Delete RSVP"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundsTab({
  funds,
  onAdjust,
  onSet,
  onAdd,
  onDelete,
}: {
  funds: ClubFund[];
  onAdjust: (id: string, delta: number) => void;
  onSet: (id: string, amount: number) => void;
  onAdd: (form: NewClubForm) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const emptyForm: NewClubForm = { club_name: '', city: '', goal_amount: '1000' };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewClubForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onAdd(form);
    if (ok) {
      setForm(emptyForm);
      setShowForm(false);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-navy-600">
          Adjust each club's fundraising amount. Use the +/− buttons for $100 increments or enter a custom amount.
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}
          className="btn-primary shrink-0 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Club
        </button>
      </div>

      {showForm && (
        <div className="card border-2 border-teal-200 p-6">
          <h3 className="font-display text-lg font-bold text-navy-900">Add New Club</h3>
          <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label-field" htmlFor="new-club-name">Club Name</label>
              <input
                id="new-club-name"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Gainesville RFC"
                value={form.club_name}
                onChange={(e) => setForm({ ...form, club_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field" htmlFor="new-club-city">City</label>
              <input
                id="new-club-city"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Gainesville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field" htmlFor="new-club-goal">Goal Amount ($)</label>
              <input
                id="new-club-goal"
                type="number"
                required
                min={100}
                className="input-field"
                value={form.goal_amount}
                onChange={(e) => setForm({ ...form, goal_amount: e.target.value })}
              />
            </div>
            <div className="flex gap-3 sm:col-span-3">
              <button type="submit" disabled={saving} className="btn-primary text-sm">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Add Club'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="btn-ghost text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {funds.length === 0 && !showForm && <EmptyState icon={Trophy} message="No club funds configured." />}

      {funds.map((fund) => {
        const pct = Math.min(100, (fund.current_amount / fund.goal_amount) * 100);
        const isComplete = fund.current_amount >= fund.goal_amount;
        const isConfirming = confirmDelete === fund.id;
        return (
          <div key={fund.id} className="card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-bold text-navy-900">{fund.club_name}</h3>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                      <CheckCircle2 className="h-3 w-3" /> Funded
                    </span>
                  )}
                </div>
                <p className="text-sm text-navy-500">{fund.city}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-display text-sm font-bold text-teal-600">{Math.round(pct)}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAdjust(fund.id, -100)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-navy-600 transition-colors hover:bg-navy-200"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-1.5">
                  <DollarSign className="h-4 w-4 text-navy-400" />
                  <input
                    type="number"
                    min={0}
                    value={fund.current_amount}
                    onChange={(e) => onSet(fund.id, Number(e.target.value))}
                    className="w-20 border-none p-0 text-sm font-bold text-navy-900 focus:outline-none focus:ring-0"
                  />
                </div>
                <button
                  onClick={() => onAdjust(fund.id, 100)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="ml-2 h-6 w-px bg-navy-200" />
                {isConfirming ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-navy-500">Remove?</span>
                    <button
                      onClick={() => { onDelete(fund.id); setConfirmDelete(null); }}
                      className="rounded-lg bg-coral-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-coral-700"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="rounded-lg bg-navy-100 px-3 py-1.5 text-xs font-bold text-navy-600 hover:bg-navy-200"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(fund.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-coral-50 hover:text-coral-600"
                    aria-label="Remove club"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-right text-xs text-navy-400">Goal: ${fund.goal_amount.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}

function SettingsTab() {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setStatus('saving');
    setErrorMsg('');

    const { error } = await supabase.rpc('set_directory_password', {
      new_password: newPassword,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setNewPassword('');
    }
  };

  return (
    <div className="max-w-lg">
      <div className="card p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100 text-navy-600">
          <Key className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Directory Password</h2>
        <p className="mt-2 text-sm text-navy-500">
          This is the password members use to unlock the directory page. Share it with approved
          members. It is stored as a secure bcrypt hash — the plaintext is never saved.
        </p>

        {status === 'success' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-teal-50 p-3 text-sm text-teal-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Directory password updated successfully.
          </div>
        )}
        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg || 'Failed to update password. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label className="label-field" htmlFor="dir-pass">New Directory Password</label>
            <input
              id="dir-pass"
              type="password"
              required
              minLength={6}
              className="input-field"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={status === 'saving'} className="btn-primary">
            {status === 'saving' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-display text-xs font-semibold uppercase tracking-wide text-navy-400">{label}: </span>
      <span className="text-navy-700">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Users; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-200 bg-white py-16 text-center">
      <Icon className="h-10 w-10 text-navy-300" />
      <p className="mt-4 text-navy-500">{message}</p>
    </div>
  );
}
