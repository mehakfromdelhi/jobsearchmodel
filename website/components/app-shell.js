import Link from "next/link";

const navigation = [
  { href: "/dashboard", label: "Analyze Roles" },
  { href: "/history", label: "History" },
  { href: "/resumes", label: "Resumes" },
  { href: "/settings", label: "Settings" }
];

export function AppShell({ title, subtitle, actions, children }) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Mehak's Job Search Model</p>
          <p>Browser-native workflow for multi-resume matching, role-fit analysis, and in-app resume revision.</p>
        </div>
        <nav className="nav-stack">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <p className="eyebrow">Core workflow</p>
          <ol>
            <li>Select resumes</li>
            <li>Paste role URLs</li>
            <li>Review ATS and HR fit</li>
            <li>Revise resume in-app</li>
          </ol>
        </div>
      </aside>
      <main className="main-panel">
        <header className="page-header">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>{title}</h2>
            {subtitle ? <p className="lede">{subtitle}</p> : null}
          </div>
          {actions ? <div className="action-row">{actions}</div> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
