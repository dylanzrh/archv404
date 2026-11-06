// Guestlist request: adds the contact to the Brevo list "GUESTLIST 2111 PENDING".
// Confirmation happens manually later, this endpoint never confirms anyone.

const DEFAULT_LIST_ID = 4; // Brevo list "GUESTLIST 2111 PENDING"
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IG_RE = /^[a-z0-9._]{1,30}$/;

function normalizeInstagram(raw: unknown): string | null | undefined {
  if (raw == null) return undefined;
  if (typeof raw !== 'string') return null;
  let v = raw.trim().toLowerCase();
  if (!v) return undefined;
  v = v.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/^@+/, '').replace(/[/?#].*$/, '');
  return IG_RE.test(v) ? v : null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body: any;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Invalid body' });
  }

  // Honeypot: bots fill hidden fields. Pretend success, store nothing.
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return res.status(200).json({ ok: true });
  }

  const name = typeof body?.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const instagram = normalizeInstagram(body?.instagram);
  const plusOne = body?.plusOne === true;

  if (name.length < 2 || name.length > 80) {
    return res.status(400).json({ error: 'invalid_name' });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ error: 'invalid_email' });
  }
  if (instagram === null) {
    return res.status(400).json({ error: 'invalid_instagram' });
  }

  const env = (globalThis as any)?.process?.env ?? {};
  const apiKey = env.BREVO_API_KEY as string | undefined;
  const listId = Number(env.BREVO_GUESTLIST_ID) || DEFAULT_LIST_ID;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing BREVO_API_KEY' });
  }

  const [firstName, ...rest] = name.split(' ');
  const attributes: Record<string, string> = {
    NAME: name,
    FIRSTNAME: firstName,
    LASTNAME: rest.join(' '),
    PLUSONE: plusOne ? 'YES' : 'NO',
  };
  if (instagram) attributes.INSTAGRAM = instagram;

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    if (!brevoRes.ok) {
      console.error('Brevo guestlist error:', brevoRes.status, await brevoRes.text());
      return res.status(502).json({ error: 'Brevo API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Guestlist handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
