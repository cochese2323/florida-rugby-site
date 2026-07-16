export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  center = true,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? 'mx-auto text-center' : ''}`}>
      {eyebrow && (
        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-coral-500">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-3xl font-bold text-navy-900 sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-navy-600">{subtitle}</p>
      )}
    </div>
  );
}

export function ProgressBar({
  current,
  goal,
  className = '',
}: {
  current: number;
  goal: number;
  className?: string;
}) {
  const pct = Math.min(100, (current / goal) * 100);
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-navy-100 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
