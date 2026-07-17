import { useState } from 'react';
import { Trophy, CheckCircle2, AlertCircle, ArrowRight, Star } from '../lib/icons';
import { supabase } from '../lib/supabase';
import { useFoundingMemberCount } from '../lib/useFoundingMembers';
import { FLORIDA_CLUBS, BUSINESS_CATEGORIES, FOUNDING_MEMBER_LIMIT } from '../lib/types';
import { navigate } from '../lib/router';

export function JoinPage() {
  const { spotsRemaining, approvedCount, loading } = useFoundingMemberCount();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    business_name: '',
    business_category: '',
    city: '',
    supported_club: 'USA Rugby (General)',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('membership_applications').insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || null,
      business_name: form.business_name || null,
      business_category: form.business_category || null,
      city: form.city || null,
      supported_club: form.supported_club,
      message: form.message || null,
    });
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div className="container-page relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-400">
              Join the Chamber
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Become a Member
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              Join Florida's first rugby-focused business chamber. Connect with fellow
              rugby players and supporters, grow your business, and support your club.
            </p>
          </div>
        </div>
      </section>

      {/* Founding Member Offer Banner */}
      <section className="bg-gradient-to-r from-gold-400 to-gold-300 py-8">
        <div className="container-page">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-4">
              <Trophy className="h-12 w-12 shrink-0 text-navy-900" />
              <div>
                <h2 className="font-display text-xl font-bold text-navy-900">
                  Founding Member Offer
                </h2>
                <p className="text-navy-800">
                  First {FOUNDING_MEMBER_LIMIT} members join free for 6 months — in tribute to
                  the Florida Rugby Union's 1974 founding and its six founding clubs.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-navy-900">
                  {loading ? '—' : approvedCount}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-navy-700">Joined</div>
              </div>
              <div className="text-center">
                <div className="font-display text-3xl font-bold text-navy-900">
                  {loading ? '—' : spotsRemaining}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-navy-700">Spots Left</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Form & Info */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-3">
            {/* Left: Benefits */}
            <div className="lg:col-span-1">
              <h2 className="font-display text-2xl font-bold text-navy-900">What You Get</h2>
              <ul className="mt-6 space-y-4">
                {[
                  'Listing in our member directory',
                  'Access to networking events & socials',
                  'Business referrals from the rugby community',
                  'Show your supported club on your listing',
                  'Support the Scoreboard Fund for your club',
                  'Free membership for 6 months (first 74 only)',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                    <span className="text-sm text-navy-700">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-xl bg-navy-50 p-6">
                <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">
                  Membership Tiers
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-white p-4 ring-1 ring-navy-100">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gold-500" />
                      <span className="font-display font-bold text-navy-900">Player Member</span>
                    </div>
                    <p className="mt-1 text-xs text-navy-500">
                      For rugby players and fans. Full directory listing and event access.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 ring-1 ring-navy-100">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-teal-500" />
                      <span className="font-display font-bold text-navy-900">Business Member</span>
                    </div>
                    <p className="mt-1 text-xs text-navy-500">
                      For business owners. Enhanced listing with logo and business details.
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-4 ring-1 ring-navy-100">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-coral-500" />
                      <span className="font-display font-bold text-navy-900">Sponsor Member</span>
                    </div>
                    <p className="mt-1 text-xs text-navy-500">
                      For clubs and organizations. Sponsorship of events and scoreboard funds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-teal-50 p-4 text-sm text-teal-700">
                <p className="font-semibold">Payment Information</p>
                <p className="mt-1">
                  Membership fees are currently processed offline. After you submit your
                  application, we'll contact you with payment details. Online payments
                  coming soon.
                </p>
              </div>
            </div>

            {/* Right: Application Form */}
            <div className="lg:col-span-2">
              {status === 'success' ? (
                <div className="card p-10 text-center shadow-lg">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-teal-600" />
                  <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">
                    Application Received!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-navy-600">
                    Thank you for applying to join the Florida Rugby Chamber of Commerce.
                    We'll review your application and contact you within 2–3 business days
                    with next steps and payment information.
                  </p>
                  <div className="mt-6 rounded-xl bg-gold-50 p-4 text-sm text-navy-700">
                    <Trophy className="mx-auto mb-2 h-6 w-6 text-gold-500" />
                    {spotsRemaining > 0 && !loading
                      ? `You're in line for a founding member spot! ${spotsRemaining} spots remain.`
                      : 'All 74 founding member spots have been claimed, but we still welcome you as a member.'}
                  </div>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button onClick={() => navigate('')} className="btn-outline">
                      Back to Home
                    </button>
                    <button onClick={() => navigate('events')} className="btn-primary">
                      View Our Launch Event
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card p-8 shadow-lg">
                  <h2 className="font-display text-2xl font-bold text-navy-900">
                    Membership Application
                  </h2>
                  <p className="mt-2 text-sm text-navy-500">
                    Fill out the form below to apply. All fields marked with * are required.
                  </p>

                  {status === 'error' && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Something went wrong submitting your application. Please try again.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="label-field" htmlFor="app-name">Full Name *</label>
                        <input
                          id="app-name"
                          type="text"
                          required
                          className="input-field"
                          value={form.full_name}
                          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="label-field" htmlFor="app-email">Email *</label>
                        <input
                          id="app-email"
                          type="email"
                          required
                          className="input-field"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="label-field" htmlFor="app-phone">Phone</label>
                        <input
                          id="app-phone"
                          type="tel"
                          className="input-field"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <label className="label-field" htmlFor="app-city">City</label>
                        <input
                          id="app-city"
                          type="text"
                          className="input-field"
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          placeholder="Orlando, FL"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="label-field" htmlFor="app-business">Business Name</label>
                        <input
                          id="app-business"
                          type="text"
                          className="input-field"
                          value={form.business_name}
                          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                          placeholder="Doe Real Estate"
                        />
                      </div>
                      <div>
                        <label className="label-field" htmlFor="app-category">Business Category</label>
                        <select
                          id="app-category"
                          className="input-field"
                          value={form.business_category}
                          onChange={(e) => setForm({ ...form, business_category: e.target.value })}
                        >
                          <option value="">Select a category</option>
                          {BUSINESS_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label-field" htmlFor="app-club">
                        Florida Rugby Team You Support *
                      </label>
                      <select
                        id="app-club"
                        required
                        className="input-field"
                        value={form.supported_club}
                        onChange={(e) => setForm({ ...form, supported_club: e.target.value })}
                      >
                        {FLORIDA_CLUBS.map((club) => (
                          <option key={club.slug} value={club.name}>
                            {club.name} {club.city !== 'Nationwide' ? `(${club.city})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-navy-400">
                        Don't have a specific club? Choose "USA Rugby (General)" to show your
                        support for rugby nationwide with a USA Rugby emblem.
                      </p>
                    </div>

                    <div>
                      <label className="label-field" htmlFor="app-message">Message (optional)</label>
                      <textarea
                        id="app-message"
                        rows={3}
                        className="input-field resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us about yourself, your business, or why you'd like to join."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-primary w-full"
                    >
                      {status === 'submitting' ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
