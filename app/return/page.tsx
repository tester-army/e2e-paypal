import { CaptureStatus, OrderStatus, type Order } from "@paypal/paypal-server-sdk";
import { connection } from "next/server";
import { Suspense } from "react";

import { ResultPanel } from "@/components/result-panel";
import { LightLink } from "@/components/ui/light-link";
import { OutlineLink } from "@/components/ui/outline-link";
import { formatUsd, fromPayPalValue } from "@/lib/item";
import { checkoutUrl, getOrders, refusedStatus } from "@/lib/paypal";

export default function ReturnPage({ searchParams }: PageProps<"/return">) {
  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto flex w-full max-w-105 flex-col gap-4">
        <Suspense fallback={<ResultPanel pending status="Checking…" detail="Asking PayPal about this payment." />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
        <OutlineLink href="/">Back to checkout</OutlineLink>
      </div>
    </main>
  );
}

async function PaymentResult({ searchParams }: Pick<PageProps<"/return">, "searchParams">) {
  const { order_id: orderId } = await searchParams;
  if (typeof orderId !== "string") {
    return <ResultPanel status="No payment" detail="PayPal sends you here after you pay." />;
  }

  // Prerendering can resolve searchParams; PayPal must only be asked per request.
  await connection();
  const order = await getOrder(orderId);
  if (!order?.id) {
    return <ResultPanel status="Not found" detail="PayPal has no order with this id." />;
  }

  const orderRow = { label: "Order", value: order.id, mono: true };

  // Approved on PayPal's page, but the capture was declined. PayPal's advice: let the shopper pay another way.
  if (order.status === OrderStatus.Approved) {
    return (
      <>
        <ResultPanel
          status="Not paid"
          detail="PayPal couldn't take the payment. Nothing was charged."
          rows={[orderRow]}
        />
        <LightLink href={checkoutUrl(order.id)}>Choose another way to pay</LightLink>
      </>
    );
  }

  if (order.status !== OrderStatus.Completed) {
    return (
      <ResultPanel
        status="Not paid"
        detail="This order wasn't approved on PayPal."
        rows={[orderRow, { label: "PayPal status", value: order.status ?? "Unknown" }]}
      />
    );
  }

  const capture = order.purchaseUnits?.[0]?.payments?.captures?.[0];
  const amount = formatUsd(fromPayPalValue(capture?.amount?.value ?? "0"));
  const paidBy = order.payer?.emailAddress ? ` by ${order.payer.emailAddress}` : "";
  const captureRow = { label: "Capture", value: capture?.id ?? "None", mono: true };

  if (capture?.status === CaptureStatus.Pending) {
    const reason = capture.statusDetails?.reason?.toLowerCase().replaceAll("_", " ") ?? "no reason given";
    return (
      <ResultPanel
        status="Pending"
        detail={`PayPal is holding ${amount}${paidBy}: ${reason}.`}
        rows={[orderRow, captureRow]}
      />
    );
  }

  if (capture?.status !== CaptureStatus.Completed) {
    return (
      <ResultPanel
        status="Not paid"
        detail="PayPal has no completed payment for this order."
        rows={[orderRow, { label: "PayPal status", value: capture?.status ?? "No capture" }]}
      />
    );
  }

  return <ResultPanel status="Paid" detail={`${amount} paid${paidBy}.`} rows={[orderRow, captureRow]} />;
}

async function getOrder(id: string): Promise<Order | null> {
  try {
    return (await getOrders().getOrder({ id })).result;
  } catch (error) {
    if (refusedStatus(error) === 404) return null;
    throw error;
  }
}
