import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
    await supabase.from("ballots").delete().neq("id", 0);
    await supabase.from("months").update({ allocated: false });

    res.json({ message: "Reset complete" });
}
