export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function betaInviteList() {
  return String(process.env.BETA_INVITE_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isInviteAllowed(email) {
  const invites = betaInviteList();
  if (!invites.length) return true;
  return invites.includes(String(email || "").trim().toLowerCase());
}

export function maxScansPerDay() {
  const value = Number(process.env.MAX_SCANS_PER_DAY || "3");
  return Number.isFinite(value) && value > 0 ? value : 3;
}
