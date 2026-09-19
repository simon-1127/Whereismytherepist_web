export default function TrustFooterBar() {
  const stats = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4" />
        </svg>
      ),
      value: "500+",
      label: "Verified Therapists",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      value: "25+",
      label: "Cities Across India",
    },
    {
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      value: "4.9/5",
      label: "Average Rating",
    },
  ];

  return (
    <section className="px-4 sm:px-8 pb-10 md:pb-16 max-w-7xl mx-auto w-full">
      <div className="bg-gradient-to-r from-blue-700 to-pink-500 rounded-3xl px-6 md:px-10 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/15 items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">Safe · Private · Compassionate Care</p>
            <p className="text-sm text-white/80">Talk to verified therapists who truly understand and care.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3">
              <span className="opacity-90">{stat.icon}</span>
              <div>
                <p className="font-extrabold text-lg leading-tight">{stat.value}</p>
                <p className="text-xs text-white/80 leading-tight whitespace-nowrap">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
