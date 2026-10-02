export default async function handler(req, res) {
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) return res.status(500).json({ error: 'APIFOOTBALL_KEY is not configured.' });

  const q = req.query || {};
  const params = new URLSearchParams();

  if (q.live === 'all') params.set('live', 'all');
  else if (q.next) params.set('next', String(Math.min(Math.max(Number(q.next) || 50, 1), 100)));
  else if (q.date) params.set('date', String(q.date));
  else if (q.from || q.to) {
    if (q.from) params.set('from', String(q.from));
    if (q.to) params.set('to', String(q.to));
  } else params.set('next', '50');

  if (q.timezone) params.set('timezone', String(q.timezone));

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?${params.toString()}`, {
      headers: { 'x-apisports-key': key, 'Accept': 'application/json' },
      cache: 'no-store'
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'API-Football request failed.' });
  }
}
