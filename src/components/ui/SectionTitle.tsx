// SectionTitle is a pure server-compatible component — no Framer Motion here
// Content must ALWAYS be visible (not opacity:0 waiting for JS)

interface SectionTitleProps {
  accent?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}

export default function SectionTitle({
  accent,
  title,
  subtitle,
  center = true,
  light = false,
}: SectionTitleProps) {
  return (
    <div className={`mb-10 md:mb-14 ${center ? 'text-center' : ''}`}>
      {accent && (
        <p className="font-accent text-gold text-xl mb-2">{accent}</p>
      )}
      <h2 className={`font-heading text-4xl md:text-5xl leading-tight ${light ? 'text-white' : 'text-deep'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 font-body text-base md:text-lg ${light ? 'text-white/60' : 'text-deep/55'}`}>
          {subtitle}
        </p>
      )}
      <div className={`mt-4 h-px w-16 bg-gradient-to-r from-gold to-fuchsia ${center ? 'mx-auto' : ''}`} />
    </div>
  );
}
