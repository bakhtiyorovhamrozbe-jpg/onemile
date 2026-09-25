const products = [
  { id:1, name:"ONEMILE Oversize Black T-Shirt", price:99000 },
  { id:2, name:"ONEMILE Premium Hoodie", price:189000 },
  { id:3, name:"ONEMILE Classic Jeans", price:179000 },
  { id:4, name:"ONEMILE White T-Shirt", price:89000 },
  { id:5, name:"ONEMILE Grey Hoodie", price:199000 },
  { id:6, name:"ONEMILE Cargo Pants", price:219000 },
  { id:7, name:"ONEMILE Street T-Shirt", price:109000 },
  { id:8, name:"ONEMILE Black Zip Hoodie", price:229000 },
  { id:9, name:"ONEMILE Blue Denim", price:189000 },
  { id:10, name:"ONEMILE Basic T-Shirt", price:79000 },
  { id:11, name:"ONEMILE Street Hoodie", price:179000 },
  { id:12, name:"ONEMILE Relax Pants", price:159000 }
];

function json(obj) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify(obj)
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json({ success: false, message: "Method not allowed" });
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return json({ success: false, message: "Noto'g'ri so'rov formati." });
  }

  const name = (data.name || "").trim();
  const phone = (data.phone || "").trim();
  const address = (data.address || "").trim();
  const comment = (data.comment || "").trim();
  const cart = Array.isArray(data.cart) ? data.cart : [];

  if (!name || !phone || !address) {
    return json({ success: false, message: "Barcha majburiy maydonlarni to'ldiring!" });
  }

  if (cart.length === 0) {
    return json({ success: false, message: "Savat bo'sh!" });
  }

  let message = "🛍 <b>ONEMILE YANGI BUYURTMA</b>\n\n";
  message += "👤 <b>Mijoz:</b> " + escapeHtml(name) + "\n";
  message += "📞 <b>Telefon:</b> " + escapeHtml(phone) + "\n";
  message += "📍 <b>Manzil:</b> " + escapeHtml(address) + "\n\n";
  message += "🛒 <b>Mahsulotlar:</b>\n";

  let total = 0;

  for (const item of cart) {
    const id = parseInt(item.id, 10) || 0;
    const qty = Math.max(1, parseInt(item.qty, 10) || 1);
    const product = products.find((p) => p.id === id);

    if (product) {
      const sum = product.price * qty;
      total += sum;
      message +=
        "• " + escapeHtml(product.name) + " — " + qty + " dona — " +
        formatNumber(sum) + " so'm\n";
    }
  }

  message += "\n💰 <b>JAMI: " + formatNumber(total) + " so'm</b>\n";

  if (comment) {
    message += "\n💬 <b>Izoh:</b> " + escapeHtml(comment);
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return json({ success: false, message: "Telegram sozlamalari kiritilmagan." });
  }

  try {
    const url = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML"
      })
    });

    const result = await response.json();

    if (result.ok) {
      return json({ success: true, message: "Buyurtmangiz qabul qilindi!" });
    } else {
      return json({ success: false, message: "Telegramga yuborishda xatolik!" });
    }
  } catch (err) {
    return json({ success: false, message: "Server xatosi yuz berdi." });
  }
};
