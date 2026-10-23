import {
  CheckoutPaymentIntent,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction,
  PaypalWalletContextShippingPreference,
} from "@paypal/paypal-server-sdk";

import { ITEM, toPayPalValue } from "@/lib/item";
import { getOrders } from "@/lib/paypal";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const value = toPayPalValue(ITEM.amount);

  const { result: order } = await getOrders().createOrder({
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: { currencyCode: "USD", value, breakdown: { itemTotal: { currencyCode: "USD", value } } },
          items: [{ name: ITEM.name, quantity: "1", unitAmount: { currencyCode: "USD", value } }],
        },
      ],
      paymentSource: {
        paypal: {
          experienceContext: {
            brandName: "e2e",
            // Otherwise PayPal picks the language from the shopper's location.
            locale: "en-US",
            shippingPreference: PaypalWalletContextShippingPreference.NoShipping,
            // PayPal's button says Complete Purchase, and /capture takes the payment without a review page of ours.
            userAction: PaypalExperienceUserAction.PayNow,
            landingPage: PaypalExperienceLandingPage.Login,
            returnUrl: `${origin}/capture`,
            cancelUrl: `${origin}/`,
          },
        },
      },
    },
  });

  const payerAction = order.links?.find((link) => link.rel === "payer-action");
  if (!payerAction) throw new Error(`PayPal order ${order.id} has no payer-action link`);

  // 303 so the browser follows with a GET; Next's redirect() is a 307 and would re-send the POST.
  return Response.redirect(payerAction.href, 303);
}
