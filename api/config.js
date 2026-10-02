export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");

  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || "";

  if (!supabaseUrl || !supabasePublishableKey) {
    return res.status(500).json({
      error: "Supabase environment variables are missing."
    });
  }

  return res.status(200).json({
    supabaseUrl,
    supabasePublishableKey
  });
}
