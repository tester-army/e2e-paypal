import { test as base } from "@e2e-dev/web";
import { Client, Environment, OrdersController } from "@paypal/paypal-server-sdk";
import { expect, unique } from "e2e";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

export const skip =
  !clientId || !clientSecret
    ? "set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to run the PayPal tests"
    : !process.env.AI_GATEWAY_API_KEY
      ? "set AI_GATEWAY_API_KEY to run the agent tests"
      : false;

export const skipWithoutBuyer =
  !process.env.PAYPAL_BUYER_EMAIL || !process.env.PAYPAL_BUYER_PASSWORD
    ? "set PAYPAL_BUYER_EMAIL and PAYPAL_BUYER_PASSWORD to run the sandbox buyer test"
    : false;

export const PAYPAL_PAGE = /^https:\/\/www\.sandbox\.paypal\.com\//;

type StartCheckout = () => Promise<string>;

const withPayPal = base.extend<{ paypal: OrdersController }>({
  // Always the sandbox, as in lib/paypal.ts.
  paypal: async ({}, use) => {
    await use(
      new OrdersController(
        new Client({
          environment: Environment.Sandbox,
          clientCredentialsAuthCredentials: { oAuthClientId: clientId ?? "", oAuthClientSecret: clientSecret ?? "" },
        }),
      ),
    );
  },
});

export const test = withPayPal.extend<{ startCheckout: StartCheckout }>({
  // Clicks Pay with PayPal on our page and returns the order id, read from our own redirect to PayPal.
  startCheckout: async ({ browser, screen }, use) => {
    await use(async () => {
      const redirect = browser.waitForResponse("**/checkout");
      await screen.getByRole("button", "Pay with PayPal").click();
      const location = (await redirect).headers.location ?? "";
      const orderId = URL.canParse(location) ? new URL(location).searchParams.get("token") : null;
      if (!orderId) throw new Error(`POST /checkout redirected to "${location}", not to a PayPal order`);
      await expect(browser).toHaveURL(PAYPAL_PAGE, { timeout: 15_000 });
      return orderId;
    });
  },
});

// A card on PayPal's guest form. CCREJECT-REFUSED as the first name makes the sandbox refuse it at capture.
export function guest() {
  return {
    number: "4012 0000 3333 0026",
    expiry: "12/30",
    cvc: "123",
    lastName: "Lovelace",
    street: "1 Main St",
    city: "San Jose",
    state: "California",
    zip: "95131",
    phone: "4085551234",
    email: unique(`guest+${Date.now()}@example.com`),
  };
}
