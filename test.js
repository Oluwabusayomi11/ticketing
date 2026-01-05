const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase values
const supabaseUrl = "https://kgkmnrskwmzzerjmsnvl.supabase.co";
const supabaseKey = "sb_publishable_wYkEs7HQlsHlvZElOcRC5Q_RTTfIphG";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from("months").select("*");
  console.log("Data:", data);
  console.log("Error:", error);
}

test();
