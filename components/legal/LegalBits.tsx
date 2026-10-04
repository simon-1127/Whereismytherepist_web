import { ReactNode } from "react";

export function LegalPart({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-16 last:mb-0">
      <h2 className="mb-8 border-b border-line pb-4 text-3xl font-bold md:text-4xl">
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
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      <div className="max-w-[72ch] space-y-3 text-[16px] leading-relaxed text-ink-2">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 marker:text-rose">
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
      className="block rounded-lg px-2 py-1.5 text-sm text-ink-2 hover:bg-mist hover:text-ink"
    >
      {children}
    </a>
  );
}
