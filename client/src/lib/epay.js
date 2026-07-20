// ePayment.kz (Homebank) integration.
// Docs: https://epayment.kz/docs — requires a registered merchant account
// (TerminalID / ClientID / ClientSecret) before any of this can actually run.
// Until EPAY_CLIENT_ID / EPAY_CLIENT_SECRET / EPAY_TERMINAL_ID are set, epayConfigured()
// returns false and callers should show a "not available yet" message instead of calling getEpayToken().

const EPAY_ENV = process.env.EPAY_ENV === "production" ? "production" : "test";

const OAUTH_URL = {
  test: "https://test-epay-oauth.epayment.kz/oauth2/token",
  production: "https://epay-oauth.homebank.kz/oauth2/token",
}[EPAY_ENV];

export function epayConfigured() {
  return Boolean(
    process.env.EPAY_CLIENT_ID &&
    process.env.EPAY_CLIENT_SECRET &&
    process.env.EPAY_TERMINAL_ID
  );
}

export async function getEpayToken() {
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "webapi payment",
    client_id: process.env.EPAY_CLIENT_ID,
    client_secret: process.env.EPAY_CLIENT_SECRET,
  });

  const response = await fetch(OAUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error("EPAY token error"), { status: response.status, body: data });
  }
  return data.access_token;
}

export { EPAY_ENV };
export const EPAY_TERMINAL_ID = process.env.EPAY_TERMINAL_ID;
