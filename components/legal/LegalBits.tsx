import { ReactNode } from "react";

export function LegalPart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-16 last:mb-0">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E1B4B] mb-8 pb-4 border-b border-slate-200">
        {title}
      </h2>
      <div className="space-y-10">{children}</div>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h3 className="text-lg font-bold text-[#1E1B4B] mb-3">{title}</h3>
      <div className="text-sm text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-slate-400">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function TocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="block text-sm text-slate-600 hover:text-blue-600 py-1.5 border-b border-slate-50 last:border-0 transition-colors"
    >
      {children}
    </a>
  );
}
