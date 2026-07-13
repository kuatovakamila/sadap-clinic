import crypto from "crypto";

const BASE_URL = process.env.SADAP_API_BASE || "https://mis.sadapclinic.kz";
const API_KEY = process.env.SADAP_API_KEY;
const API_SECRET = process.env.SADAP_API_SECRET;

function buildSignature(method, path, timestamp, bodyStr) {
  const signPath = path.split("?")[0];
  const message = `${method}:${signPath}:${timestamp}:${bodyStr}`;
  return crypto.createHmac("sha256", API_SECRET).update(message).digest("hex");
}

export async function sadapFetch(method, path, body = null) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyStr = body ? JSON.stringify(body) : "";
  const signature = buildSignature(method, path, timestamp, bodyStr);

  const headers = {
    "X-API-Key": API_KEY,
    "X-Timestamp": timestamp,
    "X-Signature": signature,
    "Content-Type": "application/json",
  };

  const options = { method, headers };
  if (body) options.body = bodyStr;

  const url = `${BASE_URL}${path}`;
  console.log(`[SADAP] ${method} ${url}`);
  console.log(`[SADAP] headers:`, { "X-API-Key": API_KEY, "X-Timestamp": timestamp, "X-Signature": signature });
  if (bodyStr) console.log(`[SADAP] body:`, bodyStr);

  const response = await fetch(url, options);
  const text = await response.text();
  console.log(`[SADAP] status:`, response.status, `body:`, text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    throw Object.assign(new Error(`SADAP ${response.status}`), {
      status: response.status,
      body: data,
    });
  }

  return data;
}
