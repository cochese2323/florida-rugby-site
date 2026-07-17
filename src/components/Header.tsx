import { useState, useEffect } from 'react';
import { Menu, X, Lock } from '../lib/icons';
import { Logo } from './Logo';
import { NavLink, navigate } from '../lib/router';

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '', label: 'Home' },
    { href: 'about', label: 'About' },
    { href: 'clubs', label: 'Clubs & Fund' },
    { href: 'events', label: 'Events' },
    { href: 'directory', label: 'Directory' },
    { href: 'contact', label: 'Contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <div className="container-page">
        <div className="flex h-18 items-center justify-between py-3">
          <a href="#/" className="shrink-0">
            <Logo />
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
            <button onClick={() => navigate('join')} className="btn-accent text-xs px-5 py-2.5">
              Join the Chamber
            </button>
          </nav>

          <button
            className="lg:hidden p-2 text-navy-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-slide-down border-t border-navy-100 bg-white lg:hidden">
          <nav className="container-page flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <span className="block py-2.5 text-base">{link.label}</span>
              </NavLink>
            ))}
            <button
              onClick={() => { setMobileOpen(false); navigate('join'); }}
              className="btn-accent mt-2 w-full"
            >
              Join the Chamber
            </button>
            <button
              onClick={() => { setMobileOpen(false); navigate('admin'); }}
              className="mt-2 flex items-center justify-center gap-1.5 py-2 text-sm text-navy-400 hover:text-navy-600"
            >
              <Lock className="h-3.5 w-3.5" /> Admin
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
