import { Target, Eye, Heart, Users, Shield, Trophy, Handshake, Sparkles } from 'lucide-react';
import { navigate } from '../lib/router';
import { SectionHeader } from '../components/ui';

export function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Page Hero */}
      <section className="relative overflow-hidden bg-navy-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-navy-950 to-navy-900" />
        <div className="container-page relative py-16 lg:py-24">
          <div className="max-w-3xl">
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-400">
              About Us
            </span>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Building Business Through Rugby
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-navy-200">
              The Florida Rugby Chamber of Commerce is the first chamber of its kind —
              a business network built around Florida's rugby community, where shared
              passion for the game opens doors to real opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Our Mission</h2>
              <p className="mt-3 leading-relaxed text-navy-600">
                To foster meaningful business connections within Florida's rugby community —
                uniting players, supporters, and businesses in a network where trust is built
                on the pitch and opportunity is created off it.
              </p>
            </div>

            <div className="card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral-50 text-coral-500">
                <Eye className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold text-navy-900">Our Vision</h2>
              <p className="mt-3 leading-relaxed text-navy-600">
                A Florida where every rugby player and supporter has a business network they
                can rely on — where clubs are supported by the businesses their members patronize,
                and where the rugby community's economic impact is recognized and celebrated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-500">
                Our Story
              </span>
              <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl">
                A Tribute to 1974
              </h2>
              <div className="mt-4 space-y-4 leading-relaxed text-navy-600">
                <p>
                  The Florida Rugby Union was founded in 1974 by six pioneering clubs that
                  believed rugby had a home in the Sunshine State. They built something from
                  nothing — and decades later, Florida rugby is thriving, with clubs from
                  Pensacola to Key West.
                </p>
                <p>
                  The Florida Rugby Chamber of Commerce carries that same spirit forward. We
                  believe the rugby community is more than a group of people who play a sport —
                  it's a network of trust, mutual support, and shared values. When a rugby
                  player needs a plumber, a lawyer, a real estate agent, or a fitness coach,
                  they should be able to find one within the rugby family.
                </p>
                <p>
                  In tribute to the Florida Rugby Union's founding in 1974, we're offering the
                  first <span className="font-semibold text-teal-700">74 members</span> free
                  membership for <span className="font-semibold text-teal-700">6 months</span> —
                  honoring both the year of founding and the six founding clubs that started it all.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-navy-900 p-8 text-white shadow-xl">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-gold-400" />
                <div className="mt-4 font-display text-6xl font-bold text-gold-400">1974</div>
                <p className="mt-2 font-display text-sm uppercase tracking-widest text-teal-200">
                  Florida Rugby Union Founded
                </p>
                <div className="mx-auto my-6 h-px w-24 bg-white/20" />
                <div className="font-display text-5xl font-bold text-white">6</div>
                <p className="mt-2 font-display text-sm uppercase tracking-widest text-teal-200">
                  Founding Clubs
                </p>
                <div className="mx-auto my-6 h-px w-24 bg-white/20" />
                <div className="font-display text-5xl font-bold text-coral-400">74</div>
                <p className="mt-2 font-display text-sm uppercase tracking-widest text-teal-200">
                  Free Founding Memberships
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader
            eyebrow="What We Value"
            title="Core Values"
            subtitle="The principles that guide everything we do."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Heart, title: 'Community First', desc: 'Every decision we make is in service of the Florida rugby community.' },
              { icon: Handshake, title: 'Mutual Support', desc: 'Members support members. Business stays in the rugby family.' },
              { icon: Trophy, title: 'Club Advocacy', desc: 'We actively fund and support Florida rugby clubs through the Scoreboard Fund.' },
              { icon: Sparkles, title: 'Authentic Connection', desc: 'Real relationships built on shared passion, not transactional networking.' },
            ].map((value, i) => (
              <div key={i} className="card-hover p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-50 text-gold-600">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section-padding bg-navy-50">
        <div className="container-page">
          <SectionHeader
            eyebrow="Leadership"
            title="Founding Team"
            subtitle="The chamber is newly formed. Leadership details will be added as the organization grows."
          />
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-200 bg-white/50 py-16 text-center">
            <Users className="h-12 w-12 text-navy-300" />
            <p className="mt-4 max-w-md text-navy-500">
              We're building our founding board. If you're passionate about Florida rugby
              and business leadership, we'd love to hear from you.
            </p>
            <button onClick={() => navigate('contact')} className="mt-6 btn-outline">
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-700 py-16">
        <div className="container-page text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Join Us in Building Something New
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
            Be a founding member of Florida's first rugby-focused business chamber.
          </p>
          <button onClick={() => navigate('join')} className="mt-8 btn-gold">
            Become a Founding Member
          </button>
        </div>
      </section>
    </div>
  );
}
