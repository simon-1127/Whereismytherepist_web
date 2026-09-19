export default function PageHeader({
  title,
  highlight,
  description,
}: {
  title: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <section className="relative bg-white border-b border-slate-100 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[20rem] rounded-full bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-pink-100/50 blur-3xl" />
      <div className="relative max-w-4xl mx-auto px-5 md:px-8 py-14 md:py-20 text-center">
        <h1 className="enter text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1E1B4B] leading-[1.15] tracking-tight mb-5">
          {title}{" "}
          {highlight && (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-pink-500">
              {highlight}
            </span>
          )}
        </h1>
        {description && (
          <p className="enter text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto" style={{ animationDelay: "120ms" }}>
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
