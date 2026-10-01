BlueStake — Match Markets Update

What changed:
- Tapping any match card opens Match Details -> Markets.
- The market screen works for live and non-live fixtures.
- Live fixtures use API-Football live odds when available.
- Non-live fixtures use API-Football pre-match odds when available.
- Markets are grouped into All, Main, Goals, Half, Bookings and Corners.
- Correct Score gets a Home / Draw / Away three-column layout.
- Over/Under markets get line / Over / Under tables.
- BlueStake deep-sea-blue/white styling is used for the market screen.
- No odds are invented: if the API has no market data, the UI says markets are unavailable.

IMPORTANT:
Keep APIFOOTBALL_KEY as the existing Vercel environment variable. Do not put the API key in index.html.

API reference:
API-Football documents /odds for pre-match odds and /odds/live for in-play odds.
