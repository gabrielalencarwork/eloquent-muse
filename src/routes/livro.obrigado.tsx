import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { z } from "zod";
import { getOrderStatus } from "@/lib/livro.functions";

const SearchSchema = z.object({ token: z.string().catch("") });

export const Route = createFileRoute("/livro/obrigado")({
  validateSearch: (search) => SearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Seu livro CARAVANA · Bárbara Luiza" },
      {
        name: "description",
        content:
          "Página de acesso ao livro de poemas CARAVANA, de Bárbara Luiza, após a confirmação do pagamento.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Seu livro CARAVANA · Bárbara Luiza" },
      {
        property: "og:description",
        content: "Acesso ao PDF do livro de poemas CARAVANA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Obrigado,
});

function Obrigado() {
  const { token } = Route.useSearch();
  const check = useServerFn(getOrderStatus);
  const [state, setState] = useState<"loading" | "paid" | "pending" | "missing">(
    "loading",
  );
  const [nome, setNome] = useState<string | null>(null);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!token) {
      setState("missing");
      return;
    }
    let stop = false;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const res = await check({ data: { token } });
        if (stop) return;
        setNome(res.nome);
        if (!res.found) return setState("missing");
        if (res.paid) return setState("paid");
        setState("pending");
        if (tries++ < 90) timer = setTimeout(poll, 4000);
      } catch {
        if (stop) return;
        setState("pending");
        if (tries++ < 90) timer = setTimeout(poll, 6000);
      }
    };

    void poll();
    return () => {
      stop = true;
      if (timer) clearTimeout(timer);
    };
  }, [token, check, tick]);


  return (
    <main className="min-h-screen bg-cream text-ink grain flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          caravana · entrega digital
        </p>

        {state === "loading" && (
          <h1 className="mt-6 font-display font-light text-4xl md:text-5xl leading-tight">
            Conferindo seu pagamento<span className="display-italic">…</span>
          </h1>
        )}

        {state === "paid" && (
          <>
            <h1 className="mt-6 font-display font-light text-4xl md:text-5xl leading-tight">
              O livro é seu{nome ? <>, <span className="display-italic">{nome}</span></> : null}.
            </h1>
            <p className="mt-6 font-body text-lg leading-relaxed text-ink/80">
              O PDF de <em>CARAVANA</em> está liberado. Também enviamos o link
              para o seu e-mail.
            </p>
            <a
              href={`/api/public/livro-download?token=${encodeURIComponent(token)}`}
              target="_blank"
              rel="noopener"
              className="mt-10 inline-flex items-center gap-3 bg-ink text-cream px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-terracotta transition-colors"
            >
              Baixar o livro
              <span>↓</span>
            </a>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              o download não começou?{" "}
              <a
                href={`/api/public/livro-download?token=${encodeURIComponent(token)}`}
                className="underline hover:text-ink"
              >
                tentar novamente
              </a>
            </p>
          </>
        )}

        {state === "pending" && (
          <>
            <h1 className="mt-6 font-display font-light text-4xl md:text-5xl leading-tight">
              Aguardando a <span className="display-italic">confirmação</span>
            </h1>
            <p className="mt-6 font-body text-lg leading-relaxed text-ink/80">
              Pix e boleto podem levar alguns instantes. Esta página se atualiza
              sozinha, e o link do livro também chega no seu e-mail assim que o
              pagamento for aprovado.
            </p>
            <button
              type="button"
              onClick={() => {
                setState("loading");
                setTick((t) => t + 1);
              }}
              className="mt-10 inline-flex items-center gap-3 border border-ink px-8 py-4 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-ink hover:text-cream transition-colors"
            >
              Verificar agora
            </button>
          </>
        )}


        {state === "missing" && (
          <>
            <h1 className="mt-6 font-display font-light text-4xl md:text-5xl leading-tight">
              Link não <span className="display-italic">encontrado</span>
            </h1>
            <p className="mt-6 font-body text-lg leading-relaxed text-ink/80">
              Verifique o link recebido por e-mail ou refaça o pedido.
            </p>
          </>
        )}

        <div className="mt-14 border-t border-border pt-8">
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-ink transition-colors"
          >
            ← voltar ao site
          </Link>
        </div>
      </div>
    </main>
  );
}
