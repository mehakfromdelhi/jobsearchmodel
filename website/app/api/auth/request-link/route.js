export async function POST(request) {
  const body = await request.json();
  const email = String(body?.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return Response.json({ error: "A valid email is required." }, { status: 400 });
  }

  return Response.json({
    ok: true,
    email,
    message: "Magic link requested. Wire this route to your email provider and token store in production."
  });
}
