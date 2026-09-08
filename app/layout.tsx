import "./globals.css";

export const metadata = {
  title: "WheresMyTherapist",
  description: "Find the right therapist for where you are in life.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
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
