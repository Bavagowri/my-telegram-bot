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
  // 1️⃣ WELCOME NEW JOINERS WITH BUTTONS
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
        text:
          `Hello ${name} 👋\n` +
          `Welcome to the 9IPL_Lucky Group!\n\n` +
          `Thank you for joining us ❤️\n` +
          `This community is built to help members stay updated, participate, and enjoy exciting opportunities.\n\n` +
          `Explore our channels, follow us on social media, and complete the mission to earn rewards!`,
        parse_mode: "HTML",

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📢 9IPL_Lucky Channel",
                url: "https://t.me/lucky_9ipl",
              }
            ],
            [
              {
                text: "👥 9IPL_Lucky Group",
                url: "https://t.me/+q5W1A5PZvrc1NDk9",
              }
            ],
            [
              {
                text: "🌐 Social Media",
                callback_data: "social_media"
              }
            ],
            [
              {
                text: "🚀 Mission - Register Now",
                url: "https://download.9ipl.bet/?dl=g6jmvo",
              }
            ]
          ]
        }
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
  // Handle button clicks
// ============================================
const callback = body?.callback_query;
if (callback) {
  const chatId = callback.message.chat.id;
  const data = callback.data;

  if (data === "social_media") {
    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "🌐 9IPL_Lucky Social Media Links:",
          reply_markup: {
            inline_keyboard: [
              [{ text: "📸 Instagram", url: "https://www.instagram.com/9ipl_lucky?igsh=cGY3bWMwanc1ZHc0" }],
              [{ text: "📘 Facebook Page", url: "https://www.facebook.com/groups/9ipllucky" }],
              [{ text: "👥 Facebook Group", url: "https://www.facebook.com/groups/9ipllucky" }],
              [{ text: "▶️ YouTube", url: "https://www.youtube.com/@lucky_9ipl" }]
            ]
          }
        })
      }
    );
  }
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
