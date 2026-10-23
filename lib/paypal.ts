import "server-only";
import { Client, Environment, OrdersController } from "@paypal/paypal-server-sdk";

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
