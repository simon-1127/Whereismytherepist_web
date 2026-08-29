import "./globals.css";

export const metadata = {
  title: "1-on-1 Video App",
  description: "Built with Supabase and Daily.co",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
