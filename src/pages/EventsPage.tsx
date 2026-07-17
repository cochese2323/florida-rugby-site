import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, PartyPopper, CheckCircle2, AlertCircle } from '../lib/icons';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

export function EventsPage() {
  const [form, setForm] = useState({ name: '', email: '', guests: 1, message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('event_rsvps').insert({
      event_id: 'usa-vs-argentina-2025',
      name: form.name,
      email: form.email,
      guests: Number(form.guests),
      message: form.message || null,
    });
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setForm({ name: '', email: '', guests: 1, message: '' });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-coral-500/20 blur-3xl" />
        <div className="container-page relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-4 py-1.5">
              <PartyPopper className="h-4 w-4 text-white" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Launch Event
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Networking Social & Tailgate
            </h1>
            <p className="mt-3 font-display text-2xl text-gold-400">USA vs Argentina</p>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              Our inaugural event. Join fellow members and rugby supporters for a networking
              social while tailgating for the USA Eagles vs Argentina in Fort Lauderdale.
            </p>
          </div>
        </div>
      </section>

      {/* Event Details */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Details */}
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-900">Event Details</h2>
              <div className="mt-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Date</h3>
                    <p className="text-navy-600">Friday, August 15, 2025</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Time</h3>
                    <p className="text-navy-600">Tailgating begins at 3:00 PM ET</p>
                    <p className="text-sm text-navy-400">Kickoff time to be confirmed</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Location</h3>
                    <p className="text-navy-600">Fort Lauderdale, Florida</p>
                    <p className="text-sm text-navy-400">Exact tailgate location sent to RSVPs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-navy-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Who Can Attend</h3>
                    <p className="text-navy-600">Open to all — members and non-members welcome</p>
                    <p className="text-sm text-navy-400">Free to attend, RSVP requested</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-navy-50 p-6">
                <h3 className="font-display text-lg font-bold text-navy-900">What to Expect</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-navy-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    Relaxed, social networking in a tailgate atmosphere
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    Meet fellow rugby players, fans, and business owners
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    Food and drinks in a casual setting
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    Watch the USA Eagles take on Argentina
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    Learn about the Chamber and how to get involved
                  </li>
                </ul>
              </div>
            </div>

            {/* RSVP Form */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-8 shadow-lg">
                <h2 className="font-display text-2xl font-bold text-navy-900">RSVP</h2>
                <p className="mt-2 text-sm text-navy-500">
                  Let us know you're coming so we can plan accordingly.
                </p>

                {status === 'success' ? (
                  <div className="mt-6 rounded-xl bg-teal-50 p-6 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-teal-600" />
                    <h3 className="mt-3 font-display text-lg font-bold text-teal-800">You're In!</h3>
                    <p className="mt-2 text-sm text-teal-700">
                      Thanks for RSVPing. We'll send the exact tailgate location to your email
                      before the event. See you in Fort Lauderdale!
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-4 text-sm font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Submit another RSVP
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {status === 'error' && (
                      <div className="flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Something went wrong. Please try again.
                      </div>
                    )}

                    <div>
                      <label className="label-field" htmlFor="rsvp-name">Name</label>
                      <input
                        id="rsvp-name"
                        type="text"
                        required
                        className="input-field"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="rsvp-email">Email</label>
                      <input
                        id="rsvp-email"
                        type="email"
                        required
                        className="input-field"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="rsvp-guests">Number of Guests (including you)</label>
                      <input
                        id="rsvp-guests"
                        type="number"
                        min={1}
                        max={10}
                        required
                        className="input-field"
                        value={form.guests}
                        onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="rsvp-message">Message (optional)</label>
                      <textarea
                        id="rsvp-message"
                        rows={3}
                        className="input-field resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Which club do you support? Anything else we should know?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-primary w-full"
                    >
                      {status === 'submitting' ? 'Submitting...' : 'Confirm RSVP'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Future Events Note */}
      <section className="bg-navy-50 py-12">
        <div className="container-page text-center">
          <h2 className="font-display text-xl font-bold text-navy-900">More Events Coming Soon</h2>
          <p className="mx-auto mt-2 max-w-xl text-navy-500">
            This is just the beginning. Watch for networking mixers, match-day socials, and
            sponsor events throughout the year. Join the Chamber to stay in the loop.
          </p>
          <button onClick={() => navigate('join')} className="mt-6 btn-outline">
            Join the Chamber
          </button>
        </div>
      </section>
    </div>
  );
}
