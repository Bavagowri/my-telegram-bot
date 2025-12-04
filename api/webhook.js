import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const message = req.body?.message;

    if (message?.chat?.id) {
      const chatId = message.chat.id;
      const text = message.text || "Hi there!";

      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: `You said: ${text}`
          })
        }
      );
    }

    return res.status(200).send("OK");
  }

  res.status(200).send("Bot is running");
}
