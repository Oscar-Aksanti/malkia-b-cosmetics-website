import './globals.css';

/**
 * Root layout — provides <html> and <body> for ALL routes.
 * Tailwind CSS is loaded here so admin + locale routes both get styles.
 * Locale-specific font classes & lang attribute are set client-side by LangSetter.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
