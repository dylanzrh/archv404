import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Body can be string or object, depending on Vercel parsing
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { email } = body as { email?: string };

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY as string,  // from Vercel env vars
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [3],          // your Brevo list ID = 3
        updateEnabled: true,   // update contact if it already exists
      }),
    });

    if (!brevoRes.ok) {
      const text = await brevoRes.text();
      console.error('Brevo error:', text);
      return res.status(500).json({ error: 'Brevo API error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Newsletter handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
