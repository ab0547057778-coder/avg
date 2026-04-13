export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const systemPrompt = `أنت مساعد مبيعات عربي لموقع Electronic Village.
تحدث بالعربية وبأسلوب مختصر واحترافي.
الخدمات:
- تصميم مواقع إلكترونية
- أنظمة حجز / إدارة
- تطوير أو تعديل موقع

هدفك:
- فهم احتياج العميل
- اقتراح الخدمة المناسبة
- تشجيعه على إرسال طلبه
- إذا احتجت، اطلب منه الاسم ورقم الجوال وتفاصيل الطلب.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-vercel-domain.vercel.app",
        "X-Title": "Electronic Village"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter error"
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "ما وصلني رد واضح.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}