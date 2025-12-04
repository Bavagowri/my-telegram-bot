import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;

    const chatId = body?.message?.chat?.id;
    const text = body?.message?.text;

    if (chatId && text) {
      // Reply to user
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `You said: ${text}`,
          }),
        }
      );
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
