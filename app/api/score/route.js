import "./globals.css";
export const metadata = {
  title: "GrantScore Pro — Know Your Score Before You Submit",
  description: "AI-powered grant application scoring across 8 dimensions.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
