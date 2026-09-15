export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const domainsResponse = await fetch("https://api.mail.tm/domains?page=1");
    const domains = await domainsResponse.json();
    const domain = domains["hydra:member"]?.[0]?.domain;

    if (!domain) {
      throw new Error("Domain email tidak tersedia");
    }

    const random = Math.random().toString(36).slice(2, 10);
    const address = `andri${random}@${domain}`;
    const password = `${crypto.randomUUID()}Aa1!`;

    const accountResponse = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address, password })
    });

    if (!accountResponse.ok) {
      throw new Error("Gagal membuat mailbox");
    }

    const tokenResponse = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ address, password })
    });

    const tokenData = await tokenResponse.json();

    return res.status(200).json({
      address,
      password,
      token: tokenData.token,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
