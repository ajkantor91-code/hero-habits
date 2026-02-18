import "./globals.css";

export const metadata = {
  title: "Hero Habits",
  description: "Task → XP → Level Up",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-amber-100 to-amber-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
