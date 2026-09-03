import { createFileRoute } from "@tanstack/react-router";

const FILE_NAME = "CARAVANA - Barbara Luiza.pdf";

function htmlMessage(title: string, body: string, status: number) {
  return new Response(
    `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${title}</title><body style="font-family:Georgia,serif;max-width:560px;margin:80px auto;padding:24px;color:#25231f;background:#f5f0e8"><h1 style="font-weight:400">${title}</h1><p style="font-size:17px;line-height:1.6">${body}</p><p><a href="/#livro" style="color:#25231f">Voltar ao site</a></p></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

export const Route = createFileRoute("/api/public/livro-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token || token.length < 10) {
          return htmlMessage("Link inválido", "Confira o link recebido por e-mail.", 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin
          .from("book_orders")
          .select("id, status, download_count")
          .eq("download_token", token)
          .maybeSingle();

        if (!order) {
          return htmlMessage("Link não encontrado", "Verifique o link recebido por e-mail ou refaça o pedido.", 404);
        }
        if (order.status !== "approved") {
          return htmlMessage(
            "Pagamento em confirmação",
            "Seu pagamento ainda não foi confirmado. Pix e boleto podem levar alguns instantes — recarregue esta página em seguida.",
            402,
          );
        }

        // Stream the PDF through this endpoint: redirects to signed URLs were
        // being blocked/mishandled by some mobile browsers and e-mail apps.
        const { data: file, error } = await supabaseAdmin.storage
          .from("livros")
          .download("caravana.pdf");

        if (error || !file) {
          console.error("livro download failed", error);
          return htmlMessage(
            "Não foi possível gerar o arquivo",
            "Tente novamente em instantes. Se persistir, responda ao e-mail de confirmação.",
            500,
          );
        }

        const bytes = await file.arrayBuffer();

        await supabaseAdmin
          .from("book_orders")
          .update({ download_count: (order.download_count ?? 0) + 1 })
          .eq("id", order.id);

        return new Response(bytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Length": String(bytes.byteLength),
            "Content-Disposition": `attachment; filename="caravana.pdf"; filename*=UTF-8''${encodeURIComponent(FILE_NAME)}`,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
