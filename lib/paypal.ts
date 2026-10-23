import "server-only";
import { Client, CustomError, Environment, OrdersController } from "@paypal/paypal-server-sdk";

let orders: OrdersController | undefined;

// Always the sandbox: PayPal's client ids don't say sandbox or live, and live credentials fail to authenticate here.
export function getOrders(): OrdersController {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to a PayPal sandbox app's credentials in .env.local.",
    );
  }
  orders ??= new OrdersController(
    new Client({
      environment: Environment.Sandbox,
      clientCredentialsAuthCredentials: { oAuthClientId: clientId, oAuthClientSecret: clientSecret },
    }),
  );
  return orders;
}

// The status of a call PayPal refused (404, 422, …), or undefined for any other error.
export function refusedStatus(error: unknown): number | undefined {
  return error instanceof CustomError ? error.statusCode : undefined;
}

// PayPal's own page for an order, where the shopper approves it (again, after a decline).
export function checkoutUrl(orderId: string): string {
  return `https://www.sandbox.paypal.com/checkoutnow?token=${encodeURIComponent(orderId)}`;
}
