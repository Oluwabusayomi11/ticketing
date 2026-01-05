import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });

  // Check if user already voted
  const { data: existing } = await supabase
    .from("ballots")
    .select("month")
    .eq("name", name)
    .single();

  if (existing) {
    return res.json({ error: "Already balloted", month: existing.month });
  }

  // Pick random unallocated month
  const { data: month } = await supabase
    .from("months")
    .select("*")
    .eq("allocated", false)
    .order("random()")
    .limit(1)
    .single();

  if (!month) return res.json({ error: "All months allocated" });

  // Allocate month
  await supabase.from("ballots").insert({ name, month: month.name });
  await supabase.from("months").update({ allocated: true }).eq("id", month.id);

  res.json({ month: month.name });
}
