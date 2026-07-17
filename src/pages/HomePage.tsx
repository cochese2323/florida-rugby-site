import {
  Users, Handshake, Trophy, TrendingUp, ArrowRight, Calendar, MapPin,
  Shield, Sparkles, ChevronRight,
} from '../lib/icons';
import { navigate } from '../lib/router';
import { useFoundingMemberCount } from '../lib/useFoundingMembers';
import { useClubFunds } from '../lib/useClubFunds';
import { SectionHeader, ProgressBar } from '../components/ui';

export function HomePage() {
  const { spotsRemaining, approvedCount, loading } = useFoundingMemberCount();
  const { funds } = useClubFunds();

  const topFunds = [...funds].sort((a, b) => b.current_amount - a.current_amount).slice(0, 3);
  const totalRaised = funds.reduce((sum, f) => sum + f.current_amount, 0);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, rgba(34,161,141,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(243,200,51,0.15) 0%, transparent 50%)`,
          }}
        />
        <div className="container-page relative py-20 lg:py-32">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 ring-1 ring-white/20">
              <Sparkles className="h-4 w-4 text-gold-400" />
              <span className="font-display text-xs font-semibold uppercase tracking-wider text-white">
                Now accepting founding members
              </span>
            </div>

            <h1 className="animate-fade-in-up animate-delay-100 mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Where Florida's Rugby Community
              <span className="block text-teal-400">Does Business</span>
            </h1>

            <p className="animate-fade-in-up animate-delay-200 mt-6 max-w-2xl text-lg leading-relaxed text-navy-200">
              The Florida Rugby Chamber of Commerce connects players, fans, clubs,
              and rugby-friendly businesses across the Sunshine State. Network, refer
              business, support your club, and grow together.
            </p>

            <div className="animate-fade-in-up animate-delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate('join')} className="btn-gold">
                Join the Chamber
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate('clubs')} className="btn-outline border-white/30 text-white hover:bg-white/10 focus:ring-white/40">
                Explore Clubs & Fund
              </button>
            </div>

            {/* Stats */}
            <div className="animate-fade-in-up animate-delay-500 mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <div>
                <div className="font-display text-3xl font-bold text-teal-400">
                  {loading ? '—' : approvedCount}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-navy-300">
                  Founding Members
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-gold-400">
                  ${totalRaised.toLocaleString()}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wider text-navy-300">
                  Raised for Clubs
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-coral-400">{funds.length}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-navy-300">
                  Florida Clubs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founding Member Offer */}
      <section className="bg-gradient-to-r from-gold-400 to-gold-300 py-6">
        <div className="container-page">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
            <div className="flex items-center gap-4">
              <Trophy className="hidden h-10 w-10 shrink-0 text-navy-900 sm:block" />
              <div>
                <p className="font-display text-lg font-bold text-navy-900">
                  In tribute to the Florida Rugby Union's founding in 1974 —
                </p>
                <p className="text-navy-800">
                  The first <span className="font-bold">74 members</span> join free for 6 months,
                  honoring the 6 founding members.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-navy-900">
                  {loading ? '—' : spotsRemaining}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-navy-700">
                  Spots Left
                </div>
              </div>
              <button
                onClick={() => navigate('join')}
                className="btn bg-navy-900 text-white hover:bg-navy-800 focus:ring-navy-700"
              >
                Claim Your Spot
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow="Why Join"
            title="More Than Networking. It's Community."
            subtitle="This past year, a student-athlete and president of the university rugby club, who happened to have an internship at NASA had trouble finding a job upon graduation. Previously, there was no mechanism for the rugby community to help someone like that. Now, there is. Membership in the Florida Rugby Chamber means business connections rooted in a shared passion for the game."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Handshake,
                title: 'Business Referrals',
                desc: 'Connect with fellow rugby players and supporters who need your services — and refer business to members you trust.',
              },
              {
                icon: Users,
                title: 'Networking Events',
                desc: 'Exclusive mixers, match-day socials, and tailgate networking events where business meets rugby.',
              },
              {
                icon: Trophy,
                title: 'Club Support',
                desc: 'Your membership helps fund scoreboards, equipment, and growth for Florida rugby clubs statewide.',
              },
              {
                icon: TrendingUp,
                title: 'Visibility',
                desc: 'Get listed in our member directory, showcase your business, and show which club you support.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="card-hover group p-6"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoreboard Fund Preview */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <SectionHeader
            eyebrow="Club Scoreboard Fund"
            title="Supporting Florida Rugby, One Club at a Time"
            subtitle="When a club's supporters collectively raise $1,000, the Chamber sends that club a brand-new scoreboard — featuring the sponsor logos of their biggest supporters."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {topFunds.map((fund) => {
              const pct = Math.round((fund.current_amount / fund.goal_amount) * 100);
              return (
                <div key={fund.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-navy-900">{fund.club_name}</h3>
                    <span className="font-display text-sm font-bold text-teal-600">{pct}%</span>
                  </div>
                  <p className="mt-1 text-xs text-navy-500">{fund.city}</p>
                  <div className="mt-4">
                    <ProgressBar current={fund.current_amount} goal={fund.goal_amount} />
                    <div className="mt-2 flex justify-between text-xs text-navy-500">
                      <span>${fund.current_amount.toLocaleString()} raised</span>
                      <span>${fund.goal_amount.toLocaleString()} goal</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => navigate('clubs')} className="btn-outline">
              See All Clubs & Progress
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Event Spotlight */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 to-navy-900 p-8 text-white shadow-xl">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-coral-500/20 blur-2xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gold-400/20 blur-2xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-coral-500 px-3 py-1">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                  <span className="font-display text-xs font-bold uppercase tracking-wider text-white">
                    Launch Event
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">
                  Networking Social & Tailgate
                </h3>
                <p className="mt-2 font-display text-xl text-gold-400">
                  USA vs Argentina
                </p>
                <div className="mt-6 space-y-3 text-sm text-navy-200">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-teal-400" />
                    <span>Friday, August 15, 2025</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-teal-400" />
                    <span>Fort Lauderdale, Florida</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-teal-400" />
                    <span>Open to all — RSVP requested</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('events')}
                  className="mt-6 btn-gold"
                >
                  View Event & RSVP
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-500">
                Our First Event
              </span>
              <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
                Kickoff Social: USA vs Argentina Tailgate
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-navy-600">
                Join us for our inaugural networking social while tailgating for the
                USA Eagles vs Argentina match in Fort Lauderdale. Meet fellow members,
                connect with business owners in the rugby community, and watch some
                world-class rugby.
              </p>
              <p className="mt-4 leading-relaxed text-navy-600">
                This is our first event as a chamber — a relaxed, social atmosphere
                where business connections happen naturally. Food, drinks, and great
                company. RSVP so we can plan accordingly.
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-navy-500">
                <Shield className="h-4 w-4 text-teal-500" />
                <span>Free to attend — membership not required for the launch event.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-teal-700 py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to Join the Chamber?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
            Be part of Florida's first rugby-focused business community.
            {spotsRemaining > 0 && !loading && (
              <span className="block mt-1 font-semibold text-gold-300">
                Only {spotsRemaining} founding member spots remaining!
              </span>
            )}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate('join')} className="btn-gold">
              Become a Founding Member
              <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate('directory')} className="btn border-white/30 text-white hover:bg-white/10 focus:ring-white/40">
              Browse the Directory
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
