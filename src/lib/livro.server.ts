import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const BOOK_PRICE = 33;
export const BOOK_CURRENCY = "BRL";
const MAX_EMAIL_ATTEMPTS = 5;

type AdminClient = SupabaseClient<Database>;
type BookOrder = Database["public"]["Tables"]["book_orders"]["Row"];

type MercadoPagoPayment = {
  id?: number | string;
  status?: string;
  external_reference?: string;
  transaction_amount?: number;
  currency_id?: string;
};

export function publicSiteOrigin(requestUrl: string) {
  const requested = new URL(requestUrl);
  if (requested.hostname === "localhost" || requested.hostname === "127.0.0.1") {
    return requested.origin;
  }
  return "https://www.barbaraluizapsi.com.br";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

async function sendBookEmail(
  supabaseAdmin: AdminClient,
  order: BookOrder,
  siteOrigin: string,
) {
  if (!order.buyer_email || order.email_sent_at) return;
  if (order.email_attempt_count >= MAX_EMAIL_ATTEMPTS) return;

  const nextAttempt = order.email_attempt_count + 1;
  const { data: claimed } = await supabaseAdmin
    .from("book_orders")
    .update({ email_attempt_count: nextAttempt })
    .eq("id", order.id)
    .eq("email_attempt_count", order.email_attempt_count)
    .is("email_sent_at", null)
    .select("id")
    .maybeSingle();

  if (!claimed) return;

  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.warn("book email not sent: missing email configuration", order.id);
    return;
  }

  const nome = escapeHtml(order.buyer_name ?? "leitora");
  const downloadUrl = `${siteOrigin}/api/public/livro-download?token=${encodeURIComponent(order.download_token)}`;
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
      <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#888;margin:0 0 16px;">caravana · bárbara luiza</p>
      <h1 style="font-size:24px;font-weight:400;margin:0 0 16px;">Seu livro chegou, ${nome}.</h1>
      <p style="font-size:17px;line-height:1.6;">Pagamento confirmado. O PDF de <em>CARAVANA</em> está pronto para leitura.</p>
      <p style="margin:28px 0;"><a href="${downloadUrl}" style="background:#1a1a1a;color:#f7f3ec;padding:14px 24px;text-decoration:none;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Baixar o livro</a></p>
      <p style="font-size:13px;color:#888;">Guarde este e-mail: o link é exclusivo e pessoal.</p>
    </div>`;

  try {
    const response = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: "Caravana <onboarding@resend.dev>",
        to: [order.buyer_email],
        reply_to: "barbaraluizasilveira@gmail.com",
        subject: "Seu livro CARAVANA está disponível",
        html,
      }),
    });

    if (!response.ok) {
      console.error("book email failed", order.id, response.status, await response.text());
      return;
    }

    await supabaseAdmin
      .from("book_orders")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", order.id)
      .is("email_sent_at", null);
  } catch (error) {
    console.error("book email threw", order.id, error);
  }
}

async function fetchPayment(paymentId: string, accessToken: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!response.ok) {
    console.error("mercadopago payment lookup failed", response.status, await response.text());
    return null;
  }
  return (await response.json()) as MercadoPagoPayment;
}

async function findPayment(orderId: string, accessToken: string) {
  const search = new URL("https://api.mercadopago.com/v1/payments/search");
  search.searchParams.set("external_reference", orderId);
  search.searchParams.set("sort", "date_created");
  search.searchParams.set("criteria", "desc");

  const response = await fetch(search, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    console.error("mercadopago payment search failed", response.status, await response.text());
    return null;
  }

  const payload = (await response.json()) as { results?: MercadoPagoPayment[] };
  return payload.results?.find((payment) => payment.status === "approved")
    ?? payload.results?.[0]
    ?? null;
}

function paymentMatchesOrder(payment: MercadoPagoPayment, order: BookOrder) {
  return payment.external_reference === order.id
    && Number(payment.transaction_amount) === Number(order.amount)
    && payment.currency_id === BOOK_CURRENCY;
}

export async function reconcileBookOrder(
  supabaseAdmin: AdminClient,
  token: string,
  siteOrigin: string,
  paymentId?: string,
) {
  const { data: found, error } = await supabaseAdmin
    .from("book_orders")
    .select("*")
    .eq("download_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!found) return null;

  let order = found;
  if (order.status !== "approved") {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    const recentlyChecked = order.last_payment_check_at
      && Date.now() - new Date(order.last_payment_check_at).getTime() < 8_000;

    if (accessToken && (!recentlyChecked || paymentId)) {
      const payment = paymentId
        ? await fetchPayment(paymentId, accessToken)
        : await findPayment(order.id, accessToken);
      const checkedAt = new Date().toISOString();

      if (payment && paymentMatchesOrder(payment, order)) {
        const status = payment.status ?? order.status;
        const update = {
          payment_id: payment.id ? String(payment.id) : order.payment_id,
          status,
          last_payment_check_at: checkedAt,
          paid_at: status === "approved" ? order.paid_at ?? checkedAt : order.paid_at,
        };
        const { data: updated } = await supabaseAdmin
          .from("book_orders")
          .update(update)
          .eq("id", order.id)
          .select("*")
          .single();
        if (updated) order = updated;
      } else {
        await supabaseAdmin
          .from("book_orders")
          .update({ last_payment_check_at: checkedAt })
          .eq("id", order.id);
      }
    }
  }

  if (order.status === "approved") {
    await sendBookEmail(supabaseAdmin, order, siteOrigin);
  }

  return order;
}

export async function reconcileBookPaymentById(
  supabaseAdmin: AdminClient,
  paymentId: string,
  siteOrigin: string,
) {
  const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
  if (!accessToken) throw new Error("Missing Mercado Pago configuration");

  const payment = await fetchPayment(paymentId, accessToken);
  if (!payment) throw new Error("Mercado Pago payment lookup failed");
  if (!payment.external_reference) return null;

  const { data: order, error } = await supabaseAdmin
    .from("book_orders")
    .select("*")
    .eq("id", payment.external_reference)
    .maybeSingle();
  if (error) throw error;
  if (!order || !paymentMatchesOrder(payment, order)) return null;

  const checkedAt = new Date().toISOString();
  const status = order.status === "approved" ? "approved" : payment.status ?? order.status;
  const { data: updated, error: updateError } = await supabaseAdmin
    .from("book_orders")
    .update({
      payment_id: payment.id ? String(payment.id) : order.payment_id,
      status,
      last_payment_check_at: checkedAt,
      paid_at: status === "approved" ? order.paid_at ?? checkedAt : order.paid_at,
    })
    .eq("id", order.id)
    .select("*")
    .single();
  if (updateError) throw updateError;

  if (updated.status === "approved") {
    await sendBookEmail(supabaseAdmin, updated, siteOrigin);
  }
  return updated;
}