export default async function handler(req, res) {
  const key = String(process.env.APIFOOTBALL_KEY || '').trim();

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
  const url = `https://v3.football.api-sports.io/fixtures?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-apisports-key': key,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const raw = await response.text();

    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = { raw };
    }

    const remaining = response.headers.get('x-ratelimit-requests-remaining');
    const limit = response.headers.get('x-ratelimit-requests-limit');

    if (remaining !== null) {
      res.setHeader('X-BlueStake-API-Remaining', remaining);
    }
    if (limit !== null) {
      res.setHeader('X-BlueStake-API-Limit', limit);
    }

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
        details: data?.errors || data?.message || data || null
      });
    }

    if (data?.errors && Object.keys(data.errors).length > 0) {
      return res.status(502).json({
        error: 'API-Football returned an error.',
        details: data.errors
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'API-Football request timed out after 8 seconds.'
        : (error?.message || String(error));

    return res.status(502).json({
      error: 'Could not reach API-Football.',
      details: message
    });
  }
}
