// ZarinPal Payment Gateway v4 client (server-only).
// Docs: https://www.zarinpal.com/docs
// - Request:  POST {base}/pg/v4/payment/request.json
// - Redirect: {base}/pg/StartPay/{authority}
// - Verify:   POST {base}/pg/v4/payment/verify.json

function base(): string {
  const sandbox = (process.env.ZARINPAL_SANDBOX ?? "").toLowerCase();
  const isSandbox = sandbox === "1" || sandbox === "true" || sandbox === "yes";
  return isSandbox ? "https://sandbox.zarinpal.com" : "https://payment.zarinpal.com";
}

function merchantId(): string {
  const m = process.env.ZARINPAL_MERCHANT_ID;
  if (!m) throw new Error("ZARINPAL_MERCHANT_ID is not configured");
  return m;
}

export type ZpRequestInput = {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
};

export type ZpRequestResult =
  | { ok: true; authority: string; startPayUrl: string }
  | { ok: false; code: number | string; message: string };

export async function zpRequest(input: ZpRequestInput): Promise<ZpRequestResult> {
  const body = {
    merchant_id: merchantId(),
    amount: input.amountToman,
    currency: "IRT", // Toman
    description: input.description.slice(0, 500),
    callback_url: input.callbackUrl,
    metadata: {
      ...(input.mobile ? { mobile: input.mobile } : {}),
      ...(input.email ? { email: input.email } : {}),
    },
  };
  let json: unknown;
  try {
    const res = await fetch(`${base()}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    json = await res.json();
  } catch (err) {
    return { ok: false, code: "network_error", message: (err as Error).message };
  }
  const j = json as {
    data?: { code?: number; authority?: string; message?: string };
    errors?: unknown;
  };
  const code = j?.data?.code;
  const authority = j?.data?.authority;
  if (code === 100 && authority) {
    return { ok: true, authority, startPayUrl: `${base()}/pg/StartPay/${authority}` };
  }
  const message =
    j?.data?.message ||
    (Array.isArray(j?.errors) ? JSON.stringify(j.errors) : JSON.stringify(j?.errors ?? "unknown"));
  return { ok: false, code: code ?? "unknown", message };
}

export type ZpVerifyResult =
  | { ok: true; refId: string; code: number; alreadyVerified: boolean }
  | { ok: false; code: number | string; message: string };

export async function zpVerify(authority: string, amountToman: number): Promise<ZpVerifyResult> {
  let json: unknown;
  try {
    const res = await fetch(`${base()}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        merchant_id: merchantId(),
        amount: amountToman,
        currency: "IRT",
        authority,
      }),
    });
    json = await res.json();
  } catch (err) {
    return { ok: false, code: "network_error", message: (err as Error).message };
  }
  const j = json as {
    data?: { code?: number; ref_id?: number | string; message?: string };
    errors?: unknown;
  };
  const code = j?.data?.code;
  const refId = j?.data?.ref_id;
  if ((code === 100 || code === 101) && refId != null) {
    return { ok: true, refId: String(refId), code, alreadyVerified: code === 101 };
  }
  const message =
    j?.data?.message ||
    (Array.isArray(j?.errors) ? JSON.stringify(j.errors) : JSON.stringify(j?.errors ?? "unknown"));
  return { ok: false, code: code ?? "unknown", message };
}