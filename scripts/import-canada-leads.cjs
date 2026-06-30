const fs = require("node:fs");
const path = require("node:path");
const XLSX = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const workspace = process.cwd();
const envPath = path.join(workspace, ".env.local");

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

const filePath = process.argv[2] || "C:/Users/Perfect Elect/Downloads/canada_website_outreach_leads.xlsx";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

function extractEmail(value) {
  const match = String(value || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : "";
}

function businessNameFromWebsite(value) {
  try {
    const parsed = new URL(String(value || "").startsWith("http") ? value : `https://${value}`);
    return parsed.hostname.replace(/^www\./, "").split(".")[0].replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "Canada Website Lead";
  }
}

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets["Canada Website Leads"] || workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

const leads = rows
  .map((row) => {
    const email = extractEmail(row["Email / Contact"]);
    if (!email) return null;

    return {
      business_name: businessNameFromWebsite(row.Website),
      contact_name: null,
      email,
      website: row.Website || null,
      instagram: null,
      industry: row.Category || null,
      location: "Canada",
      service_to_pitch: "Website redesign",
      notes: [row.Notes, row.Priority ? `Priority: ${row.Priority}` : "", row["Source URL"] ? `Source: ${row["Source URL"]}` : ""].filter(Boolean).join("\n"),
      status: "New"
    };
  })
  .filter(Boolean);

async function main() {
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("leads").upsert(leads, { onConflict: "email", ignoreDuplicates: true }).select("id,email");

  if (error) {
    throw new Error(error.message);
  }

  console.log(`Workbook rows: ${rows.length}`);
  console.log(`Valid email leads: ${leads.length}`);
  console.log(`Inserted or returned rows: ${data ? data.length : 0}`);
  console.log("Done.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
