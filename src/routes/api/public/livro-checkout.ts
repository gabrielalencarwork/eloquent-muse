import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CheckoutSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
});

const BOOK_PRICE = 33;

function errorResponse(message: string, status = 400) {
  return new Response(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Pagamento indisponível</title><body style="font-family:Georgia,serif;max-width:560px;margin:80px auto;padding:24px;color:#25231f;background:#f5f0e8"><h1 style="font-weight:400">Não foi possível abrir o pagamento.</h1><p>${message}</p><p><a href="/#livro" style="color:#25231f">Voltar e tentar novamente</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

async function handleCheckout(request: Request) {
  {
    {
        const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
        if (!accessToken) return errorResponse("O pagamento está temporariamente indisponível.", 503);

        const source =
          request.method === "GET"
            ? Object.fromEntries(new URL(request.url).searchParams)
            : Object.fromEntries(await request.formData());
        const parsed = CheckoutSchema.safeParse(source);
        if (!parsed.success) return errorResponse("Confira seu nome e e-mail e tente novamente.");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const origin = new URL(request.url).origin;
        const { data: order, error } = await supabaseAdmin
          .from("book_orders")
          .insert({
            buyer_name: parsed.data.nome,
            buyer_email: parsed.data.email,
            amount: BOOK_PRICE,
            status: "pending",
          })
          .select("id, download_token")
          .single();

        if (error || !order) {
          console.error("book checkout order insert failed", error);
          return errorResponse("Não foi possível iniciar o pedido. Tente novamente.", 500);
        }

        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items: [{
              id: "caravana",
              title: "CARAVANA — livro de poemas (PDF)",
              description: "Livro de poemas de Bárbara Luiza, entrega digital em PDF.",
              category_id: "art",
              quantity: 1,
              currency_id: "BRL",
              unit_price: BOOK_PRICE,
            }],
            payer: { name: parsed.data.nome, email: parsed.data.email },
            external_reference: order.id,
            statement_descriptor: "CARAVANA",
            notification_url: `${origin}/api/public/mercadopago-webhook`,
            back_urls: {
              success: `${origin}/livro/obrigado?token=${order.download_token}`,
              pending: `${origin}/livro/obrigado?token=${order.download_token}`,
              failure: `${origin}/#livro`,
            },
          }),
        });

        const body = await response.text();
        if (!response.ok) {
          console.error("mercadopago checkout preference failed", response.status, body);
          return errorResponse("O serviço de pagamento não respondeu. Tente novamente em instantes.", 502);
        }

        const preference = JSON.parse(body) as { id?: string; init_point?: string };
        if (!preference.id || !preference.init_point) {
          console.error("mercadopago checkout preference incomplete");
          return errorResponse("O serviço de pagamento retornou uma resposta incompleta.", 502);
        }

        await supabaseAdmin
          .from("book_orders")
          .update({ preference_id: preference.id })
          .eq("id", order.id);

        return new Response(null, {
          status: 303,
          headers: { Location: preference.init_point, "Cache-Control": "no-store" },
        });
  }
  }
}

export const Route = createFileRoute("/api/public/livro-checkout")({
  server: {
    handlers: {
      GET: ({ request }) => handleCheckout(request),
      POST: ({ request }) => handleCheckout(request),
    },
  },
});