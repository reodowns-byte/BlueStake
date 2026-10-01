export default async function handler(req, res) {
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) return res.status(500).json({ error: 'APIFOOTBALL_KEY is not configured' });
  const allowed = ['live','date','league','season','team','next','last','id'];
  const params = new URLSearchParams();
  for (const name of allowed) {
    const value = req.query[name];
    if (value !== undefined && value !== '') params.set(name, String(value));
  }
  const url = `https://v3.football.api-sports.io/fixtures?${params.toString()}`;
  try {
    const r = await fetch(url, { headers: { 'x-apisports-key': key, 'Accept': 'application/json' } });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'API request failed' });
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Unable to reach API-Football' });
  }
}
