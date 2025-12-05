import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running");
  }

  const body = req.body;
  const message = body?.message;

  if (!message) return res.status(200).send("No message");

  const chatId = message.chat.id;

  // ============================================
  // 1️⃣ WELCOME NEW JOINERS
  // ============================================
  const newMembers = message?.new_chat_members;
  if (newMembers && newMembers.length > 0) {
    for (const member of newMembers) {
      const name = member.first_name || "Friend";

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Hello ${name}! Welcome to the 9IPL_Lucky Group!\nThank you for joining and we appreciate your participation Dear!`
        })
      });
    }
  }

  // ============================================
  // 2️⃣ AUTO REPLY: If user says "hi" → reply "hello"
  // ============================================
  const text = message.text?.toLowerCase() || "";

  if (text === "hi") {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "hello"
        })
      }
    );
  }

  // ============================================
  // 3️⃣ DELETE LINK MESSAGES FROM NON-ADMINS
  // ============================================
  const userId = message.from?.id;

  const linkRegex = /(https?:\/\/|t\.me\/|www\.)/i;
  const containsLink = linkRegex.test(text);

  if (containsLink) {
    // Check if user is admin
    const adminRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`
    );
    const adminData = await adminRes.json();

    const isAdmin =
      adminData?.result?.status === "administrator" ||
      adminData?.result?.status === "creator";

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

  return res.status(200).send("OK");
}
