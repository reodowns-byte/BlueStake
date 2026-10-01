BlueStake final Vercel package

Upload/replace in reodowns-byte/BlueStake main:
- index.html
- vercel.json
- api/fixtures.js

The existing Vercel project is connected to this repository. After committing, Vercel should deploy automatically.

Keep the existing Vercel Production environment variable:
APIFOOTBALL_KEY = your private API-Football key

Do not put the API key in index.html or GitHub.

Home opens directly to Live Matches. Join and Login are shown at the top right. The account UI in this package is a clearly labelled frontend demo; connect a real auth provider before collecting real credentials.

Deposit/withdrawal UI is demo-only and does not request an activation fee or process real funds.
