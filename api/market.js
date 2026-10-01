export default async function handler(req, res) {
  const key = process.env.APIFOOTBALL_KEY;
  const fixture = String(req.query.fixture || '').trim();
  const live = String(req.query.live || '') === '1';
  if (!key) return res.status(500).json({ error: 'APIFOOTBALL_KEY is not configured' });
  if (!fixture || !/^\d+$/.test(fixture)) return res.status(400).json({ error: 'A valid fixture id is required' });
  const endpoint = live ? 'odds/live' : 'odds';
  try {
    const url = `https://v3.football.api-sports.io/${endpoint}?fixture=${encodeURIComponent(fixture)}`;
    const r = await fetch(url, { headers: { 'x-apisports-key': key, 'Accept': 'application/json' } });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'API request failed' });
    const response = Array.isArray(data.response) ? data.response : [];
    const bookmakers = [];
    response.forEach(item => (item.bookmakers || []).forEach(b => bookmakers.push(b)));
    const bookmaker = bookmakers[0];
    if (!bookmaker) return res.status(200).json({ bookmaker: null, groups: [], response: data.response || [] });
    const groups = [];
    for (const bet of (bookmaker.bets || [])) {
      const values = Array.isArray(bet.values) ? bet.values.map(v => ({ value: v.value, odd: v.odd, handicap: v.handicap, main: v.main })) : [];
      if (values.length) groups.push({ id: bet.id, name: bet.name, values });
    }
    res.setHeader('Cache-Control', live ? 's-maxage=10, stale-while-revalidate=20' : 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ bookmaker: bookmaker.name, groups, markets: groups });
  } catch (e) {
    return res.status(500).json({ error: 'Unable to load markets' });
  }
}
