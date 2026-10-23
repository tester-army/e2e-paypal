import { getOrders, refusedStatus } from "@/lib/paypal";

// PayPal's return_url: /capture?token=<order id>&PayerID=… once the shopper approves on PayPal's page.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("token");
  if (!orderId) return Response.redirect(new URL("/return", url), 303);

  try {
    // No PayPal-Request-Id: it would replay a declined capture after the shopper approves again.
    // Capturing a captured order again returns the same capture, so a reload is harmless.
    await getOrders().captureOrder({ id: orderId });
  } catch (error) {
    // 422: declined (INSTRUMENT_DECLINED) or not approved; 404: no such order. /return reads the order and says which.
    const status = refusedStatus(error);
    if (status !== 422 && status !== 404) throw error;
  }

  return Response.redirect(new URL(`/return?order_id=${encodeURIComponent(orderId)}`, url), 303);
}
