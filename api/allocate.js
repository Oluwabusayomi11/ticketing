import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).end();
    }

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Name required" });
    }

    // Check if user already voted
    const { data: existing } = await supabase
        .from("ballots")
        .select("month")
        .eq("name", name)
        .single();

    if (existing) {
        return res.json({ error: "Already balloted", month: existing.month });
    }

    // Get random free month
    const { data: month } = await supabase
        .from("months")
        .select("*")
        .eq("allocated", false)
        .order("random()")
        .limit(1)
        .single();

    if (!month) {
        return res.json({ error: "All months allocated" });
    }

    // Allocate
    await supabase.from("ballots").insert({
        name,
        month: month.name
    });

    await supabase
        .from("months")
        .update({ allocated: true })
        .eq("id", month.id);

    res.json({ month: month.name });
}
