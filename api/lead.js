export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || "Leads";

    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
      return res.status(500).json({ error: "Airtable environment variables are missing" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, phone, service, details } = body || {};

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: {
          name: name || "غير مذكور",
          phone: phone || "غير مذكور",
          service: service || "غير محدد",
          details: details || "لا يوجد",
          source: "website_form",
          status: "new"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Airtable error"
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}