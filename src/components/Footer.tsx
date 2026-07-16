import { Mail, MapPin, Shield, Lock } from 'lucide-react';
import { Logo } from './Logo';
import { navigate } from '../lib/router';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-200">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 w-fit">
              <Logo className="[&_span]:text-white [&_.text-teal-700]:text-teal-400 [&_.text-navy-500]:text-navy-300" />
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-300">
              Connecting Florida's rugby community with business opportunity —
              networking, referrals, and club support across the Sunshine State.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: '', label: 'Home' },
                { href: 'about', label: 'About' },
                { href: 'clubs', label: 'Clubs & Scoreboard Fund' },
                { href: 'events', label: 'Events' },
                { href: 'directory', label: 'Member Directory' },
                { href: 'join', label: 'Join the Chamber' },
                { href: 'contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={`#/${link.href}`}
                    className="text-navy-300 transition-colors hover:text-teal-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Get in Touch
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-navy-300">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <a href="mailto:info@floridarugbychamber.com" className="hover:text-teal-400">
                  info@floridarugbychamber.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Fort Lauderdale, Florida</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Proudly serving Florida's rugby community since 2026</span>
              </li>
            </ul>
            <button
              onClick={() => navigate('admin')}
              className="mt-5 flex items-center gap-1.5 text-xs text-navy-400 transition-colors hover:text-navy-200"
            >
              <Lock className="h-3 w-3" /> Admin Portal
            </button>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-center text-xs text-navy-400">
            © {new Date().getFullYear()} Florida Rugby Chamber of Commerce.
          </p>
        </div>
      </div>
    </footer>
  );
}
