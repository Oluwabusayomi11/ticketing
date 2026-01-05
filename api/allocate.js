const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  // Check if name already used
  const { data: existing, error: existingError } = await supabase
    .from("ballots")
    .select("month")
    .eq("name", name)
    .maybeSingle();

  if (existing) {
    return res.json({
      error: "Already balloted",
      month: existing.month
    });
  }

  // Get an unallocated month
  const { data: months, error: monthError } = await supabase
    .from("months")
    .select("*")
    .eq("allocated", false)
    .limit(1);

  if (monthError) {
    return res.status(500).json({ error: monthError.message });
  }

  if (!months || months.length === 0) {
    return res.json({ error: "All months allocated" });
  }

  const month = months[0];

  // Save allocation
  await supabase.from("ballots").insert({
    name,
    month: month.name
  });

  await supabase
    .from("months")
    .update({ allocated: true })
    .eq("id", month.id);

  return res.json({ month: month.name });
}
