import { useState } from 'react';
import { Mail, MapPin, MessageSquare, CheckCircle2, AlertCircle, Send, Users } from '../lib/icons';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase.from('contact_messages').insert({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
    });
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
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
              Contact Us
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              Have a question about membership, events, or the Scoreboard Fund? We'd love
              to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="font-display text-2xl font-bold text-navy-900">Reach Out</h2>
              <p className="mt-3 leading-relaxed text-navy-600">
                Whether you're interested in joining, want to learn more about the Scoreboard
                Fund, or have ideas for the Chamber, we're here to help.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Email</h3>
                    <a href="mailto:info@floridarugbychamber.com" className="text-navy-600 hover:text-teal-600">
                      info@floridarugbychamber.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Location</h3>
                    <p className="text-navy-600">Fort Lauderdale, Florida</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy-900">Response Time</h3>
                    <p className="text-navy-600">We aim to respond within 2–3 business days.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-navy-50 p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-teal-600" />
                  <h3 className="font-display text-base font-bold text-navy-900">
                    Ready to Join?
                  </h3>
                </div>
                <p className="mt-2 text-sm text-navy-600">
                  Skip the wait and apply directly through our membership application.
                </p>
                <button onClick={() => navigate('join')} className="mt-4 btn-outline text-sm">
                  Start Your Application
                </button>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              {status === 'success' ? (
                <div className="card p-10 text-center shadow-lg">
                  <CheckCircle2 className="mx-auto h-14 w-14 text-teal-600" />
                  <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">
                    Message Sent!
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-navy-600">
                    Thanks for reaching out. We'll get back to you within 2–3 business days.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <div className="card p-8 shadow-lg">
                  <h2 className="font-display text-2xl font-bold text-navy-900">Send a Message</h2>

                  {status === 'error' && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-coral-50 p-3 text-sm text-coral-700">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Something went wrong. Please try again.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="label-field" htmlFor="contact-name">Name *</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        className="input-field"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="contact-email">Email *</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        className="input-field"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="contact-subject">Subject *</label>
                      <input
                        id="contact-subject"
                        type="text"
                        required
                        className="input-field"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="What's this about?"
                      />
                    </div>
                    <div>
                      <label className="label-field" htmlFor="contact-message">Message *</label>
                      <textarea
                        id="contact-message"
                        rows={5}
                        required
                        className="input-field resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="Tell us what's on your mind..."
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="btn-primary w-full"
                    >
                      {status === 'submitting' ? 'Sending...' : 'Send Message'}
                      {status !== 'submitting' && <Send className="h-4 w-4" />}
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
