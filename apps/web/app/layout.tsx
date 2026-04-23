import "./globals.css";

export const metadata = {
  title: "Coffee Pre-ordering",
  description: "Order coffee ahead of time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen selection:bg-coffee/30 selection:text-coffee-light">
        {children}
      </body>
    </html>
  )
}
