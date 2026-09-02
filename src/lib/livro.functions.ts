import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CheckoutSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  origin: z.string().trim().url(),
});

export const BOOK_PRICE = 33;

export const createBookCheckout = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CheckoutSchema.parse(input))
  .handler(async ({ data }) => {
    const token = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!token) throw new Error("Pagamento indisponível no momento.");

    const origin = data.origin.replace(/\/+$/, "");

    const { data: order, error } = await supabaseAdmin
      .from("book_orders")
      .insert({
        buyer_name: data.nome,
        buyer_email: data.email,
        amount: BOOK_PRICE,
        status: "pending",
      })
      .select("id, download_token")
      .single();

    if (error || !order) {
      console.error("book order insert error", error);
      throw new Error("Não foi possível iniciar o pedido.");
    }

    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            id: "caravana",
            title: "CARAVANA — livro de poemas (PDF)",
            description: "Livro de poemas de Bárbara Luiza, entrega digital em PDF.",
            category_id: "art",
            quantity: 1,
            currency_id: "BRL",
            unit_price: BOOK_PRICE,
          },
        ],
        payer: { name: data.nome, email: data.email },
        external_reference: order.id,
        statement_descriptor: "CARAVANA",
        notification_url: `${origin}/api/public/mercadopago-webhook`,
        back_urls: {
          success: `${origin}/livro/obrigado?token=${order.download_token}`,
          pending: `${origin}/livro/obrigado?token=${order.download_token}`,
          failure: `${origin}/#livro`,
        },
        ...(origin.startsWith("https://") ? { auto_return: "approved" } : {}),
      }),
    });

    const body = await res.text();
    if (!res.ok) {
      console.error("mercadopago preference failed", res.status, body);
      throw new Error("Não foi possível abrir o pagamento. Tente novamente.");
    }

    const pref = JSON.parse(body) as { id: string; init_point: string };

    await supabaseAdmin
      .from("book_orders")
      .update({ preference_id: pref.id })
      .eq("id", order.id);

    return { checkoutUrl: pref.init_point };
  });

const StatusSchema = z.object({ token: z.string().trim().min(10).max(80) });

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: order } = await supabaseAdmin
      .from("book_orders")
      .select("status, buyer_name")
      .eq("download_token", data.token)
      .maybeSingle();

    if (!order) return { found: false, paid: false, nome: null as string | null };

    return {
      found: true,
      paid: order.status === "approved",
      nome: order.buyer_name as string | null,
    };
  });
