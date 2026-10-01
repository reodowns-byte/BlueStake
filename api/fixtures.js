export default async function handler(req, res) {
  const key = process.env.APIFOOTBALL_KEY;

  if (!key) {
    return res.status(500).json({
      error: "APIFOOTBALL_KEY is not configured in Vercel."
    });
  }

  const allowed = [
    "live",
    "date",
    "league",
    "season",
    "team",
    "next",
    "last",
    "id"
  ];

  const params = new URLSearchParams();

  for (const name of allowed) {
    const value = req.query?.[name];

    if (typeof value === "string" && value.trim()) {
      params.set(name, value.trim());
    }
  }

  if (![...params.keys()].length) {
    params.set("live", "all");
  }

  try {
    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?${params.toString()}`,
      {
        headers: {
          "x-apisports-key": key,
          "Accept": "application/json"
        }
      }
    );

    const data = await response.json();

    res.setHeader(
      "Cache-Control",
      "s-maxage=15, stale-while-revalidate=30"
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.message || "API-Football request failed."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(502).json({
      error: "Unable to reach API-Football.",
      details: error?.message || "Unknown error"
    });
  }
}
