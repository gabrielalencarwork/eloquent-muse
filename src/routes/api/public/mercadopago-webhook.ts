import { createFileRoute } from "@tanstack/react-router";

async function sendBookEmail(to: string, nome: string, downloadUrl: string) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.warn("book email not sent: missing keys");
    return;
  }

  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#888;margin:0 0 16px;">caravana · bárbara luiza</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 16px;">Seu livro chegou, ${nome.replace(/[<>&]/g, "")}.</h1>
      <p style="font-size:17px;line-height:1.6;">Pagamento confirmado. O PDF de <em>CARAVANA</em> está pronto para leitura.</p>
      <p style="margin:28px 0;">
        <a href="${downloadUrl}" style="background:#1a1a1a;color:#f7f3ec;padding:14px 24px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Baixar o livro</a>
      </p>
      <p style="font-size:13px;color:#888;">Guarde este e-mail: o link é exclusivo e pessoal.</p>
    </div>`;

  const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify({
      from: "Caravana <onboarding@resend.dev>",
      to: [to],
      reply_to: "barbaraluizasilveira@gmail.com",
      subject: "Seu livro CARAVANA está disponível",
      html,
    }),
  });

  if (!res.ok) console.error("book email failed", res.status, await res.text());
}

export const Route = createFileRoute("/api/public/mercadopago-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!token) return new Response("not configured", { status: 500 });

        const url = new URL(request.url);
        let paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

        try {
          const raw = await request.text();
          if (raw) {
            const body = JSON.parse(raw) as {
              type?: string;
              topic?: string;
              data?: { id?: string | number };
            };
            const kind = body.type ?? body.topic;
            if (kind && kind !== "payment") return new Response("ignored");
            if (body.data?.id) paymentId = String(body.data.id);
          }
        } catch {
          /* keep query-param id */
        }

        if (!paymentId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const payRes = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!payRes.ok) {
          console.error("mp payment fetch failed", payRes.status, await payRes.text());
          return new Response("payment lookup failed", { status: 200 });
        }

        const payment = (await payRes.json()) as {
          status?: string;
          external_reference?: string;
        };

        if (!payment.external_reference) return new Response("ok");

        const { data: order } = await supabaseAdmin
          .from("book_orders")
          .select("id, status, buyer_email, buyer_name, download_token")
          .eq("id", payment.external_reference)
          .maybeSingle();

        if (!order) return new Response("ok");

        const alreadyApproved = order.status === "approved";

        await supabaseAdmin
          .from("book_orders")
          .update({
            payment_id: String(paymentId),
            status: payment.status ?? "pending",
            paid_at: payment.status === "approved" ? new Date().toISOString() : null,
          })
          .eq("id", order.id);

        if (payment.status === "approved" && !alreadyApproved && order.buyer_email) {
          const downloadUrl = `${url.origin}/api/public/livro-download?token=${order.download_token}`;
          await sendBookEmail(order.buyer_email, order.buyer_name ?? "leitora", downloadUrl);
        }

        return new Response("ok");
      },
      GET: async () => new Response("ok"),
    },
  },
});
