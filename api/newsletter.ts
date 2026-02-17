export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vercel may give body as string or object
  const body =
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const email = body?.email;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Avoid TypeScript "process" type errors without installing @types/node
  const apiKey = (globalThis as any)?.process?.env?.BREVO_API_KEY as string | undefined;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing BREVO_API_KEY' });
  }

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
        listIds: [3],
        updateEnabled: true,
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
