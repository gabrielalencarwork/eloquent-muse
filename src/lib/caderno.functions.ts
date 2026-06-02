import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const InputSchema = z.object({
  nome: z.string().trim().min(1).max(80),
  texto: z.string().trim().min(1).max(2000),
});

const DESTINATION_EMAIL = "barbaraluizasilveira@gmail.com";

export const submitCadernoMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    // 1. Persist message (source of truth, never lost)
    const { error: dbError } = await supabaseAdmin
      .from("caderno_messages")
      .insert({ nome: data.nome, texto: data.texto });

    if (dbError) {
      console.error("caderno insert error", dbError);
      throw new Error("Não foi possível salvar a mensagem.");
    }

    // 2. Send email via Resend (through Lovable connector gateway)
    const lovableKey = process.env.LOVABLE_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!lovableKey || !resendKey) {
      console.warn("Email not sent: missing LOVABLE_API_KEY or RESEND_API_KEY");
      return { ok: true, emailed: false };
    }

    const escape = (s: string) =>
      s.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
      );

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1a1a1a;">
        <p style="font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#888;margin:0 0 16px;">
          caderno aberto · nova palavra
        </p>
        <h1 style="font-size:22px;font-weight:400;margin:0 0 24px;">
          De <em style="color:#b85a3e;">${escape(data.nome)}</em>
        </h1>
        <blockquote style="border-left:2px solid #9caf88;padding:8px 0 8px 18px;margin:0 0 24px;font-size:17px;line-height:1.6;color:#222;">
          ${escape(data.texto).replace(/\n/g, "<br/>")}
        </blockquote>
        <p style="font-size:12px;color:#999;margin:32px 0 0;">
          Enviado pelo site · ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </p>
      </div>
    `;

    try {
      const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": resendKey,
        },
        body: JSON.stringify({
          from: "Caderno Aberto <onboarding@resend.dev>",
          to: [DESTINATION_EMAIL],
          reply_to: DESTINATION_EMAIL,
          subject: `Caderno Aberto · ${data.nome}`,
          html,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error("Resend send failed", res.status, body);
        return { ok: true, emailed: false };
      }
    } catch (e) {
      console.error("Resend send threw", e);
      return { ok: true, emailed: false };
    }

    return { ok: true, emailed: true };
  });
