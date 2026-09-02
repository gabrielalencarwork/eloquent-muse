import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/livro-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token || token.length < 10) {
          return new Response("Link inválido.", { status: 400 });
        }

        const { data: order } = await supabaseAdmin
          .from("book_orders")
          .select("id, status, download_count")
          .eq("download_token", token)
          .maybeSingle();

        if (!order) return new Response("Link não encontrado.", { status: 404 });
        if (order.status !== "approved") {
          return new Response("Pagamento ainda não confirmado.", { status: 402 });
        }

        const { data: signed, error } = await supabaseAdmin.storage
          .from("livros")
          .createSignedUrl("caravana.pdf", 60 * 10, {
            download: "CARAVANA - Barbara Luiza.pdf",
          });

        if (error || !signed) {
          console.error("signed url error", error);
          return new Response("Não foi possível gerar o arquivo.", { status: 500 });
        }

        await supabaseAdmin
          .from("book_orders")
          .update({ download_count: (order.download_count ?? 0) + 1 })
          .eq("id", order.id);

        return new Response(null, {
          status: 302,
          headers: { Location: signed.signedUrl, "Cache-Control": "no-store" },
        });
      },
    },
  },
});
