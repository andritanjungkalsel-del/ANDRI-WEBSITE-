export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Token tidak tersedia" });

  try {
    const response = await fetch("https://api.mail.tm/messages?page=1", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const detail = await response.text();
      return res.status(response.status).json({ error: detail || "Token mailbox tidak valid" });
    }

    const data = await response.json();
    const messages = (data["hydra:member"] || []).map((mail) => ({
      id: mail.id,
      from: mail.from?.address || "unknown",
      subject: mail.subject || "(Tanpa subjek)",
      intro: mail.intro || "",
      seen: !!mail.seen,
      createdAt: mail.createdAt
    }));

    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Gagal mengambil inbox" });
  }
}
