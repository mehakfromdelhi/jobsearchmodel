import "./globals.css";

export const metadata = {
  title: "Mehak's Job Search Model",
  description: "Browser-native recruiting workflow for business-role candidates."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
