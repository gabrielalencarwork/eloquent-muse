import { createFileRoute } from "@tanstack/react-router";
import { publicSiteOrigin, reconcileBookPaymentById } from "@/lib/livro.server";

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");
        let notificationKind = url.searchParams.get("type") ?? url.searchParams.get("topic");

        try {
          const raw = await request.text();
          if (raw) {
            const body = JSON.parse(raw) as {
              type?: string;
              topic?: string;
              data?: { id?: string | number };
            };
            notificationKind = body.type ?? body.topic ?? notificationKind;
            if (body.data?.id) paymentId = String(body.data.id);
          }
        } catch {
          /* keep query-param id */
        }

        if (!paymentId) return new Response("ignored", { status: 202 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const origin = publicSiteOrigin(request.url);

        try {
          if (notificationKind === "merchant_order") {
            const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
            if (!token) throw new Error("Missing Mercado Pago configuration");
            const merchantResponse = await fetch(
              `https://api.mercadopago.com/merchant_orders/${encodeURIComponent(paymentId)}`,
              { headers: { Authorization: `Bearer ${token}` } },
            );
            if (!merchantResponse.ok) throw new Error("Merchant order lookup failed");
            const merchantOrder = (await merchantResponse.json()) as {
              payments?: Array<{ id?: number | string }>;
            };
            for (const payment of merchantOrder.payments ?? []) {
              if (payment.id) {
                await reconcileBookPaymentById(supabaseAdmin, String(payment.id), origin);
              }
            }
          } else {
            await reconcileBookPaymentById(supabaseAdmin, paymentId, origin);
          }
        } catch (error) {
          console.error("mercadopago webhook processing failed", error);
          return new Response("retry", { status: 500 });
        }

        return new Response("ok");
      },
      GET: async () => new Response("ok"),
    },
  },
});
