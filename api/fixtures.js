export default async function handler(req, res) {
  const key = process.env.APIFOOTBALL_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'APIFOOTBALL_KEY is not configured.'
    });
  }

  const q = req.query || {};
  const params = new URLSearchParams();

  if (q.live === 'all') {
    params.set('live', 'all');
  } else if (q.id) {
    params.set('id', String(q.id));
  } else if (q.next) {
    params.set(
      'next',
      String(Math.min(Math.max(Number(q.next) || 50, 1), 100))
    );
  } else if (q.date) {
    params.set('date', String(q.date));
  } else if (q.from || q.to) {
    if (q.from) params.set('from', String(q.from));
    if (q.to) params.set('to', String(q.to));
  } else {
    params.set('next', '50');
  }

  if (q.timezone) {
    params.set('timezone', String(q.timezone));
  }

  const isLive = q.live === 'all';

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?${params.toString()}`,
      {
        headers: {
          'x-apisports-key': key,
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();

    // Pass API-Football quota information back to BlueStake.
    const remaining = response.headers.get('x-ratelimit-requests-remaining');
    const limit = response.headers.get('x-ratelimit-requests-limit');

    if (remaining !== null) {
      res.setHeader('X-BlueStake-API-Remaining', remaining);
    }
    if (limit !== null) {
      res.setHeader('X-BlueStake-API-Limit', limit);
    }

    // Cache live fixtures briefly at Vercel's edge so many users
    // do not create a separate API-Football request.
    if (isLive && response.ok) {
      res.setHeader(
        'Cache-Control',
        'public, s-maxage=15, stale-while-revalidate=30'
      );
    } else {
      res.setHeader('Cache-Control', 'no-store');
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'API-Football request failed.',
        status: response.status,
        details: data?.errors || data?.message || null
      });
    }

    // API-Football can return an errors object even when HTTP is 200.
    if (data?.errors && Object.keys(data.errors).length > 0) {
      return res.status(502).json({
        error: 'API-Football returned an error.',
        details: data.errors
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: 'API-Football request failed.',
      details: error?.message || null
    });
  }
}
