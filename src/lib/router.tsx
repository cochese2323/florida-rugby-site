import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'about' }
  | { name: 'clubs' }
  | { name: 'events' }
  | { name: 'join' }
  | { name: 'directory' }
  | { name: 'contact' }
  | { name: 'admin' };

function parseHash(): Route {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  switch (hash) {
    case 'about': return { name: 'about' };
    case 'clubs': return { name: 'clubs' };
    case 'events': return { name: 'events' };
    case 'join': return { name: 'join' };
    case 'directory': return { name: 'directory' };
    case 'contact': return { name: 'contact' };
    case 'admin': return { name: 'admin' };
    default: return { name: 'home' };
  }
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(path: string) {
  window.location.hash = `/${path}`;
}

export function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const check = () => {
      const current = window.location.hash.replace('#/', '').replace('#', '');
      setActive(current === href);
    };
    check();
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, [href]);

  return (
    <a
      href={`#/${href}`}
      onClick={onClick}
      className={`font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
        active ? 'text-teal-600' : 'text-navy-700 hover:text-teal-600'
      }`}
    >
      {children}
    </a>
  );
}
