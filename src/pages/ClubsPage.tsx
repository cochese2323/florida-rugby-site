import { Trophy, MapPin, Shield, DollarSign, TrendingUp, Award } from 'lucide-react';
import { navigate } from '../lib/router';
import { useClubFunds } from '../lib/useClubFunds';
import { SectionHeader, ProgressBar } from '../components/ui';

export function ClubsPage() {
  const { funds, loading } = useClubFunds();

  const sortedFunds = [...funds].sort((a, b) => b.current_amount - a.current_amount);
  const totalRaised = funds.reduce((sum, f) => sum + f.current_amount, 0);
  const clubsComplete = funds.filter((f) => f.current_amount >= f.goal_amount).length;

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div className="container-page relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-400">
              Clubs & Scoreboard Fund
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Supporting Florida Rugby Clubs
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              When a club's supporters collectively raise $1,000, the Chamber sends that club
              a brand-new scoreboard — potentially featuring the sponsor logos of their biggest
              supporters. Here's how each club is doing.
            </p>
          </div>
        </div>
      </section>

      {/* Fund Stats */}
      <section className="bg-white py-12 border-b border-navy-100">
        <div className="container-page">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="card p-6 text-center">
              <DollarSign className="mx-auto h-8 w-8 text-teal-600" />
              <div className="mt-3 font-display text-3xl font-bold text-navy-900">
                ${totalRaised.toLocaleString()}
              </div>
              <p className="mt-1 text-sm text-navy-500">Total Raised</p>
            </div>
            <div className="card p-6 text-center">
              <Trophy className="mx-auto h-8 w-8 text-gold-500" />
              <div className="mt-3 font-display text-3xl font-bold text-navy-900">
                {clubsComplete}
              </div>
              <p className="mt-1 text-sm text-navy-500">Scoreboards Funded</p>
            </div>
            <div className="card p-6 text-center">
              <Shield className="mx-auto h-8 w-8 text-coral-500" />
              <div className="mt-3 font-display text-3xl font-bold text-navy-900">
                {funds.length}
              </div>
              <p className="mt-1 text-sm text-navy-500">Clubs Participating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <SectionHeader
            eyebrow="Leaderboard"
            title="Fundraising Progress"
            subtitle="Clubs ranked by total raised toward their $1,000 scoreboard goal."
          />

          {loading ? (
            <div className="mt-10 text-center text-navy-400">Loading club data...</div>
          ) : (
            <div className="mt-10 space-y-4">
              {sortedFunds.map((fund, index) => {
                const pct = Math.round((fund.current_amount / fund.goal_amount) * 100);
                const isComplete = fund.current_amount >= fund.goal_amount;
                return (
                  <div key={fund.id} className="card p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold ${
                            index === 0
                              ? 'bg-gold-100 text-gold-700'
                              : index === 1
                              ? 'bg-navy-100 text-navy-600'
                              : index === 2
                              ? 'bg-coral-100 text-coral-600'
                              : 'bg-navy-50 text-navy-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-bold text-navy-900">{fund.club_name}</h3>
                            {isComplete && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                                <Award className="h-3 w-3" /> Funded
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-navy-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {fund.city}
                          </div>
                        </div>
                      </div>
                      <div className="sm:w-64">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-navy-900">${fund.current_amount.toLocaleString()}</span>
                          <span className="text-navy-400">of ${fund.goal_amount.toLocaleString()}</span>
                        </div>
                        <ProgressBar current={fund.current_amount} goal={fund.goal_amount} />
                        <div className="mt-1.5 text-right text-xs font-semibold text-teal-600">{pct}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow="How It Works"
            title="The Scoreboard Fund"
            subtitle="A simple, transparent way to support your club."
          />
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                num: '1',
                icon: TrendingUp,
                title: 'Members Support Their Club',
                desc: 'When you join the Chamber, you designate the Florida rugby club you support. A portion of your membership contributes to that club\'s scoreboard fund.',
              },
              {
                num: '2',
                icon: DollarSign,
                title: 'We Track Progress',
                desc: 'Each club\'s fundraising progress is tracked publicly on this page. Watch the progress bar fill as your club\'s supporters grow.',
              },
              {
                num: '3',
                icon: Trophy,
                title: 'Scoreboard Delivered',
                desc: 'When a club reaches $1,000, the Chamber orders a new scoreboard — featuring the sponsor logos of the club\'s biggest supporters — and delivers it to the club.',
              },
            ].map((step, i) => (
              <div key={i} className="relative card p-8">
                <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 font-display text-sm font-bold text-white shadow-md">
                  {step.num}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USA Rugby Note */}
      <section className="bg-navy-50 py-12">
        <div className="container-page">
          <div className="mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-navy-900 to-teal-900 p-8 text-center text-white shadow-lg">
            <Shield className="mx-auto h-10 w-10 text-coral-400" />
            <h3 className="mt-3 font-display text-xl font-bold">
              Support Rugby in General?
            </h3>
            <p className="mt-2 text-navy-200">
              Members who don't have a specific Florida club can show their support for rugby
              nationwide with a USA Rugby emblem on their directory listing.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Support Your Club. Join Today.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
            Your membership helps fund scoreboards for Florida rugby clubs.
          </p>
          <button onClick={() => navigate('join')} className="mt-8 btn-gold">
            Become a Member
          </button>
        </div>
      </section>
    </div>
  );
}
