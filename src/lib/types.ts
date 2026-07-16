export type MembershipApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  business_category: string | null;
  city: string | null;
  supported_club: string;
  message: string | null;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  name: string;
  email: string;
  guests: number;
  message: string | null;
  created_at: string;
};

export type ClubFund = {
  id: string;
  club_name: string;
  city: string;
  slug: string;
  current_amount: number;
  goal_amount: number;
  description: string | null;
  sort_order: number;
};

export type Club = {
  name: string;
  city: string;
  slug: string;
};

export const FLORIDA_CLUBS: Club[] = [
  { name: 'Orlando Griffins', city: 'Orlando', slug: 'orlando-griffins' },
  { name: 'Boca Raton Rugby', city: 'Boca Raton', slug: 'boca-raton' },
  { name: 'Tampa Bay Krewe', city: 'Tampa', slug: 'tampa-bay-krewe' },
  { name: 'Jacksonville Rugby', city: 'Jacksonville', slug: 'jacksonville' },
  { name: 'Miami Rugby', city: 'Miami', slug: 'miami' },
  { name: 'Fort Lauderdale RFC', city: 'Fort Lauderdale', slug: 'fort-lauderdale' },
  { name: 'Naples Rugby', city: 'Naples', slug: 'naples' },
  { name: 'Sarasota Rugby', city: 'Sarasota', slug: 'sarasota' },
  { name: 'USA Rugby (General)', city: 'Nationwide', slug: 'usa-rugby' },
];

export const BUSINESS_CATEGORIES = [
  'Real Estate',
  'Law / Legal Services',
  'Finance / Accounting',
  'Construction / Trades',
  'Healthcare / Medical',
  'Fitness / Training',
  'Hospitality / Food & Beverage',
  'Marketing / Media',
  'Technology',
  'Insurance',
  'Automotive',
  'Retail',
  'Other',
];

export const FOUNDING_MEMBER_LIMIT = 74;
