import crypto from "crypto";

// Node 24 内置 fetch，可直接使用
export default async function handler(req, res) {
  // 1️⃣ 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 2️⃣ 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 3️⃣ 处理 POST 请求
  if (req.method === "POST") {
    try {
      const { amount, order_no } = JSON.parse(req.body || "{}");

      if (!amount || !order_no) {
        return res.status(400).json({ error: "Missing amount or order_no" });
      }

      // 商户信息（密钥只在这里，不放前端）
      const merAccount = "8892630";
      const payType = "16002";
      const payKey = "d1869ca8e2cde5eef18bae2b4994dbf3";

      const dataArr = {
        mer_no: merAccount,
        order_amount: amount,
        order_no: order_no,
        payemail: "14234361@email.com",
        payphone: "13888888888",
        currency: "MYR",
        paytypecode: payType,
        method: "trade.create",
        payname: "star_hot",
        returnurl: "https://your-shopify-domain/notify"
      };

      // 生成签名
      const signStr =
        `currency=${dataArr.currency}` +
        `&mer_no=${dataArr.mer_no}` +
        `&method=${dataArr.method}` +
        `&order_amount=${dataArr.order_amount}` +
        `&order_no=${dataArr.order_no}` +
        `&payemail=${dataArr.payemail}` +
        `&payname=${dataArr.payname}` +
        `&payphone=${dataArr.payphone}` +
        `&paytypecode=${dataArr.paytypecode}` +
        `&returnurl=${dataArr.returnurl}` +
        payKey;

      dataArr.sign = crypto.createHash("md5").update(signStr).digest("hex");

      // 调用支付接口
      const fetchRes = await fetch("https://wkpluss.com/gateway/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataArr)
      });

      const result = await fetchRes.json();

      // 返回 JSON 给 Shopify 前端
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
