export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, id } = req.body || {};
  if (!token || !id) return res.status(400).json({ error: "Token atau ID email tidak tersedia" });

  try {
    const response = await fetch(`https://api.mail.tm/messages/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({ error: detail || "Gagal membuka email" });
    }

    const mail = await response.json();
    return res.status(200).json({
      id: mail.id,
      from: mail.from?.address || "unknown",
      to: mail.to?.map(x => x.address).join(", ") || "",
      subject: mail.subject || "(Tanpa subjek)",
      text: mail.text || "",
      html: mail.html || "",
      createdAt: mail.createdAt
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Gagal membuka email" });
  }
}
