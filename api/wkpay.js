import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "POST") {
    let bodyData = {};
    try {
      if (typeof req.body === "string") bodyData = JSON.parse(req.body);
      else if (typeof req.body === "object") bodyData = req.body;
      else return res.status(400).json({ error: "Invalid request body" });
    } catch (err) {
      return res.status(400).json({ error: "Invalid JSON" });
    }

    const { amount, order_no } = bodyData;
    if (!amount || !order_no) return res.status(400).json({ error: "Missing amount or order_no" });

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
      returnurl: "https://shopify.com/97349927221/account/orders?locale=zh-CN&region_country=MY"
    };

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

    try {
      const fetchRes = await fetch("https://wkpluss.com/gateway/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataArr)
      });
      const result = await fetchRes.json();
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

