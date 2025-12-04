import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running");
  }

  const message = req.body?.message;
  if (!message) return res.status(200).send("No message");

  const chatId = message.chat.id;
  const userId = message.from.id;
  const text = message.text || "";

  // 1️⃣ Detect if message contains a link
  const linkRegex = /(https?:\/\/|t\.me\/|www\.)/i;
  const containsLink = linkRegex.test(text);

  if (containsLink) {

    // 2️⃣ Check if the user is an admin
    const adminRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`
    );
    const adminData = await adminRes.json();

    const isAdmin =
      adminData?.result?.status === "administrator" ||
      adminData?.result?.status === "creator";

    // 3️⃣ If NOT admin → delete the message
    if (!isAdmin) {
      await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/deleteMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: message.message_id
          })
        }
      );
    }
  }

  // Respond OK to Telegram
  return res.status(200).send("OK");
}
