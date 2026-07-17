import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PUBLISHED_ID = "2PACX-1vQ5OgXJIOKDVpaDExH2CW8F88h8ld-VV6Oq6_msDU8ZWEUaLVgaKe3uB9Z4SSy3y-Vl9R2iwoNsLi7-";
const GID = "346857463";

// /pub?output=csv is the correct endpoint for "Published to the web" sheets —
// it works from servers without cookies or authentication.
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pub?output=csv&gid=${GID}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const res = await fetch(CSV_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      },
      redirect: "follow",
    });

    const text = await res.text();

    // If Google returned an HTML error page, surface it as a 502.
    if (!res.ok || text.trimStart().startsWith("<!") || text.trimStart().startsWith("<html")) {
      return new Response(
        JSON.stringify({ error: "Sheet unavailable", detail: text.slice(0, 300) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": "text/csv; charset=utf-8" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
