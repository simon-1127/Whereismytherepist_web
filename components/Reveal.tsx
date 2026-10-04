/**
 * Kept so existing imports keep working. Sections no longer fade in one by
 * one on scroll — the home hero is the single orchestrated moment.
 */
export default function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return <div className={className}>{children}</div>;
}
