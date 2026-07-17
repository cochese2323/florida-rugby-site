import { useRouter } from './lib/router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ClubsPage } from './pages/ClubsPage';
import { EventsPage } from './pages/EventsPage';
import { JoinPage } from './pages/JoinPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';

export default function App() {
  const route = useRouter();

  const isAdmin = route.name === 'admin';

  const page = (() => {
    switch (route.name) {
      case 'home':      return <HomePage />;
      case 'about':     return <AboutPage />;
      case 'clubs':     return <ClubsPage />;
      case 'events':    return <EventsPage />;
      case 'join':      return <JoinPage />;
      case 'directory': return <DirectoryPage />;
      case 'contact':   return <ContactPage />;
      case 'admin':     return <AdminPage />;
      default:          return <HomePage />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col">
      {!isAdmin && <Header />}
      <main className="flex-1">{page}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}
