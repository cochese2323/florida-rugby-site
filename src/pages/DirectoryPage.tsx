import { useState, useEffect } from 'react';
import { Lock, Shield, AlertCircle, ArrowRight, Table, Loader2, RefreshCw } from '../lib/icons';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

const CSV_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sheet-proxy`;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      row.push(cell); cell = '';
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some(c => c.trim())) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); if (row.some(c => c.trim())) rows.push(row); }
  return rows;
}

function DirectoryTable() {
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const load = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await fetch(CSV_URL, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
      });
      if (!res.ok) throw new Error('fetch failed');
      const text = await res.text();
      setRows(parseCSV(text));
    } catch {
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3 text-navy-500">
        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        <span>Loading directory...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-coral-400" />
        <div>
          <p className="font-semibold text-navy-800">Could not load directory</p>
          <p className="mt-1 text-sm text-navy-500">
            Make sure the Google Sheet is shared as "Anyone with the link can view".
          </p>
        </div>
        <button onClick={load} className="btn">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-navy-500">
        No entries found in the directory.
      </div>
    );
  }

  const [header, ...dataRows] = rows;
  const HIDDEN_COLS = new Set(['id', 'message', 'status', 'created_at']);
  const visibleCols = header
    .map((col, i) => ({ col, i }))
    .filter(({ col }) => !HIDDEN_COLS.has(col.trim().toLowerCase()));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-navy-900 text-white">
            {visibleCols.map(({ col }, pos) => (
              <th key={col} className={`px-4 py-3 text-left font-semibold tracking-wide whitespace-nowrap${pos === 0 ? ' rounded-tl-xl' : ''}${pos === visibleCols.length - 1 ? ' rounded-tr-xl' : ''}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, ri) => (
            <tr
              key={ri}
              className={ri % 2 === 0 ? 'bg-white hover:bg-teal-50' : 'bg-navy-50 hover:bg-teal-50'}
            >
              {visibleCols.map(({ col, i }) => (
                <td key={col} className="border-b border-navy-100 px-4 py-3 text-navy-700">
                  {row[i] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DirectoryPage() {
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);

    const { data, error: rpcError } = await supabase.rpc('verify_directory_password', {
      input_password: password,
    });

    setVerifying(false);

    if (rpcError) {
      setError(true);
      return;
    }

    if (data === true) {
      setUnlocked(true);
      setPassword('');
    } else {
      setError(true);
    }
  };

  if (unlocked) {
    return (
      <div className="flex flex-col">
        <section className="relative overflow-hidden bg-navy-950 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
          <div className="container-page relative py-12">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-400">
                  Member Directory
                </span>
                <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                  Business Connections
                </h1>
              </div>
              <button
                onClick={() => setUnlocked(false)}
                className="btn border-white/30 text-white hover:bg-white/10 focus:ring-white/40"
              >
                <Lock className="h-4 w-4" />
                Lock Directory
              </button>
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-page">
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-teal-50 p-4 text-sm text-teal-700">
              <Table className="h-5 w-5 shrink-0" />
              <p>
                The directory below is maintained in a Google Sheet controlled by the Chamber.
                To add or update your listing, contact us.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-navy-200 shadow-lg">
              <DirectoryTable />
              <div className="flex items-center justify-center bg-navy-50 py-4">
                <p className="text-sm text-navy-500">
                  Having trouble viewing the directory?{' '}
                  <a
                    href="mailto:info@floridarugbychamber.com"
                    className="font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-teal-700 py-16">
          <div className="container-page text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Want to Be Listed Here?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
              Join the Chamber and get your business in front of Florida's rugby community.
            </p>
            <button onClick={() => navigate('join')} className="mt-8 btn-gold">
              Join the Chamber
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div className="container-page relative py-16 lg:py-24">
          <div className="max-w-2xl">
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-400">
              Member Directory
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Business Connections
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              Our member directory is a curated list of rugby-friendly businesses across Florida.
              Members receive the access password when they join.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="card p-8 shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Lock className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">
                Enter Password
              </h2>
              <p className="mt-2 text-sm text-navy-500">
                The member directory is password-protected. Enter the password provided
                with your membership to access business listings.
              </p>

              {error && (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Incorrect password. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="label-field" htmlFor="dir-password">Directory Password</label>
                  <input
                    id="dir-password"
                    type="password"
                    required
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the member password"
                    autoFocus
                  />
                </div>
                <button type="submit" disabled={verifying} className="btn-primary w-full">
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Unlock Directory
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-navy-100 pt-4">
                <div className="flex items-start gap-3 rounded-lg bg-navy-50 p-4 text-sm text-navy-600">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
                  <div>
                    <p className="font-semibold text-navy-700">Not a member yet?</p>
                    <p className="mt-1">
                      Join the Chamber to get directory access and list your business.
                    </p>
                    <button
                      onClick={() => navigate('join')}
                      className="mt-2 font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Become a Member →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
