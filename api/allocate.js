const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  // Check if name already balloted
  const { data: existing, error: existingError } = await supabase
    .from("ballots")
    .select("month")
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({ error: existingError.message });
  }

  if (existing) {
    return res.json({
      error: "Already balloted",
      month: existing.month
    });
  }

  // Get unallocated months
  const { data: months, error: monthError } = await supabase
    .from("months")
    .select("*")
    .eq("allocated", false);

  if (monthError) {
    return res.status(500).json({ error: monthError.message });
  }

  if (!months || months.length === 0) {
    return res.json({ error: "All months allocated" });
  }

  // Pick random month
  const randomIndex = Math.floor(Math.random() * months.length);
  const month = months[randomIndex];

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
};

