// Vercel serverless function: receives the email from the page and writes it to Airtable.
// Required environment variables (set in Vercel project settings):
//   AIRTABLE_TOKEN     - Airtable personal access token (scope: data.records:write)
//   AIRTABLE_BASE_ID   - e.g. appXXXXXXXXXXXXXX
//   AIRTABLE_TABLE     - table name, e.g. Signups

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = String(body?.email || "").trim();
  const source = String(body?.source || "landing").slice(0, 100);

  if (!EMAIL_RE.test(email) || email.length > 120) {
    return res.status(400).json({ error: "invalid email" });
  }

  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${encodeURIComponent(process.env.AIRTABLE_TABLE)}`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [{ fields: { Email: email, Source: source, Signed_up: new Date().toISOString() } }],
        typecast: true,
      }),
    });
    if (!r.ok) {
      console.error("Airtable error", r.status, await r.text());
      return res.status(502).json({ error: "airtable" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: "network" });
  }
}
