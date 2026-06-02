import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import heroStill from "@/assets/hero-still.jpg";
import windowLight from "@/assets/window-light.jpg";
import { submitCadernoMessage } from "@/lib/caderno.functions";

export const Route = createFileRoute("/")({
  component: Index,
});

const WHATSAPP_URL =
  "https://wa.me/?text=Ol%C3%A1%2C%20Bárbara.%20Gostaria%20de%20agendar%20uma%20sess%C3%A3o.";
const SUBSTACK_URL = "https://substack.com/@tendacigana?r=69r2p6&utm_medium=ios&utm_source=stories&shareImageVariant=image";
const LINKTREE_URL =
  "https://linktr.ee/barbaraluiza.psi";

function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-cream/70 border-b border-border/60">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-4 flex items-center justify-between">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-[1.35rem] leading-none tracking-tight">
            Bárbara<span className="display-italic"> Luiza</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hidden sm:inline">
            · psicanalista
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-9 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <a href="#escuta" className="hover:text-ink transition-colors">Escuta</a>
          <a href="#metodo" className="hover:text-ink transition-colors">Método</a>
          <a href="#sobre" className="hover:text-ink transition-colors">Sobre</a>
          <a href="#contato" className="hover:text-ink transition-colors">Contato</a>
        </nav>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] uppercase tracking-[0.22em] px-4 py-2.5 border border-ink/80 text-ink hover:bg-ink hover:text-cream transition-colors"
        >
          Agendar
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 grid grid-cols-12 gap-6 md:gap-10 items-end">
        <div className="col-span-12 lg:col-span-7 animate-reveal">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-8">
            <span className="inline-block w-8 h-px bg-sage-deep" />
            <span>CRP 04/65357 — Atendimento online</span>
          </div>

          <h1 className="font-display font-light text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.035em] text-ink">
            A escuta
            <br />
            <span className="display-italic font-normal text-sage-deep">como</span>{" "}
            <span className="relative">
              ofício
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 C 80 2, 160 10, 298 4"
                  stroke="oklch(0.64 0.13 45)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span className="text-muted-foreground">artesanal.</span>
          </h1>

          <p className="mt-10 max-w-xl font-body text-lg md:text-xl leading-relaxed text-ink/80">
            Psicanálise de orientação lacaniana para mulheres que desejam
            atravessar suas angústias, revisitar escolhas e encontrar novas
            formas de habitar a própria história.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 bg-ink text-cream px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-sage-deep transition-colors"
            >
              Agendar uma sessão
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#metodo"
              className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink/70 hover:text-ink transition-colors"
            >
              <span className="w-6 h-px bg-current" />
              Sobre o método
            </a>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 relative">
          <div className="relative aspect-[3/4] overflow-hidden grain animate-drift">
            <img
              src={heroStill}
              alt="Galho de oliveira e pequeno vaso de cerâmica sobre linho cru, banhados por luz natural"
              width={1080}
              height={1440}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-cream border border-border px-5 py-4 max-w-[15rem] hidden md:block">
            <p className="font-display italic text-[0.95rem] leading-snug text-ink">
              "trata-se de um trabalho construído a partir do que você traz —
              palavras, silêncios, dúvidas e desejos."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = [
    "escuta",
    "✦",
    "palavra",
    "✦",
    "desejo",
    "✦",
    "silêncio",
    "✦",
    "singularidade",
    "✦",
    "tempo",
    "✦",
    "história",
    "✦",
  ];
  const line = [...words, ...words];
  return (
    <div className="border-y border-border bg-paper overflow-hidden py-6">
      <div className="flex whitespace-nowrap animate-marquee">
        {line.concat(line).map((w, i) => (
          <span
            key={i}
            className={
              w === "✦"
                ? "text-terracotta mx-8 text-base"
                : "font-display italic text-2xl md:text-3xl mx-8 text-ink/80"
            }
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function Escuta() {
  return (
    <section id="escuta" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            i. princípio
          </p>
          <h2 className="mt-4 font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-tight">
            Um espaço para
            <span className="display-italic text-sage-deep"> se ouvir</span>.
          </h2>
        </div>
        <div className="col-span-12 md:col-span-7 md:col-start-6 space-y-6 font-body text-lg leading-relaxed text-ink/85">
          <p className="first-letter:font-display first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:text-sage-deep first-letter:font-normal">
            A psicanálise não oferece respostas prontas nem fórmulas mágicas. É um
            processo subjetivo, único para cada pessoa, que respeita seu tempo,
            suas experiências e o ritmo da sua história.
          </p>
          <p>
            Meu trabalho é criar um espaço onde a escuta e a palavra se tornam
            instrumentos para você <em className="display-italic">se</em> ouvir —
            não para resolver a vida, mas para encontrar novas formas, mais
            autênticas, de habitá-la.
          </p>
        </div>
      </div>
    </section>
  );
}

function Metodo() {
  const pillars = [
    {
      n: "01",
      title: "Orientação lacaniana",
      body: "Uma escuta clínica fundada na palavra do sujeito — no que se diz, no que escapa, no que insiste em retornar.",
    },
    {
      n: "02",
      title: "Tempo próprio",
      body: "Cada análise tem seu ritmo. Nada de protocolos fechados: o processo se constrói no encontro, sessão a sessão.",
    },
    {
      n: "03",
      title: "Trabalho artesanal",
      body: "Como uma melodia composta de notas distintas, a análise permite que cada singularidade encontre sua expressão.",
    },
  ];
  return (
    <section id="metodo" className="py-24 md:py-36 bg-paper border-y border-border relative grain">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="flex items-baseline justify-between mb-16 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
              ii. método
            </p>
            <h2 className="mt-4 font-display font-light text-4xl md:text-6xl leading-[1.02] tracking-tight max-w-2xl">
              O analítico se faz
              <span className="display-italic text-terracotta"> a dois</span>.
            </h2>
          </div>
          <p className="font-body text-base md:text-lg text-ink/70 max-w-sm italic">
            "assim como uma melodia se compõe de notas distintas que encontram
            harmonia."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {pillars.map((p) => (
            <article
              key={p.n}
              className="bg-paper p-8 md:p-10 group hover:bg-cream transition-colors duration-500"
            >
              <div className="flex items-baseline justify-between mb-10">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  {p.n}
                </span>
                <span className="w-10 h-px bg-sage-deep group-hover:w-16 transition-all duration-500" />
              </div>
              <h3 className="font-display font-light text-2xl md:text-[1.7rem] leading-tight mb-4">
                {p.title}
              </h3>
              <p className="font-body text-[1.02rem] leading-relaxed text-ink/75">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sobre() {
  return (
    <section id="sobre" className="py-24 md:py-36">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid grid-cols-12 gap-10 items-center">
        <div className="col-span-12 md:col-span-5 order-2 md:order-1">
          <div className="relative aspect-[4/5] overflow-hidden grain">
            <img
              src={windowLight}
              alt="Silhueta em frente a uma janela com cortina de linho, luz suave entrando"
              width={1280}
              height={1600}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 md:col-start-7 order-1 md:order-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            iii. quem escuta
          </p>
          <h2 className="mt-4 font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-tight">
            Bárbara <span className="display-italic text-sage-deep">Luiza</span>
          </h2>

          <p className="mt-6 font-body text-lg leading-relaxed text-ink/85">
            Psicóloga formada pela PUC Minas há quatro anos, em formação contínua
            em psicanálise. Pós-graduanda em Psicanálise, Clínica e Sexualidade.
          </p>
          <p className="mt-4 font-body text-lg leading-relaxed text-ink/85">
            A música, que sempre fez parte da minha trajetória, inspira minha
            escuta. Como uma melodia composta de notas distintas, o trabalho
            analítico permite que cada singularidade encontre sua expressão —
            um caminho próprio, cheio de nuances.
          </p>

          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Registro
              </dt>
              <dd className="mt-2 font-display text-xl">CRP 04/65357</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Formação
              </dt>
              <dd className="mt-2 font-display text-xl">PUC Minas</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Abordagem
              </dt>
              <dd className="mt-2 font-display text-xl display-italic">
                Psicanálise lacaniana
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Atendimento
              </dt>
              <dd className="mt-2 font-display text-xl">Online · mundo</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

function ParaQuem() {
  const items = [
    "Mulheres que sentem angústias difíceis de nomear",
    "Quem deseja revisitar escolhas e relações",
    "Quem se sente diante de algo que parece intransponível",
    "Quem busca um espaço de palavra, não de conselhos",
  ];
  return (
    <section className="py-24 md:py-32 bg-sage-deep text-cream relative overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/60">
            iv. para quem
          </p>
          <h2 className="mt-4 font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-tight text-cream">
            Se você sente que é
            <span className="display-italic"> hora de se escutar</span>.
          </h2>
        </div>
        <ul className="col-span-12 md:col-span-6 md:col-start-7 space-y-5">
          {items.map((t, i) => (
            <li
              key={i}
              className="flex items-baseline gap-5 border-b border-cream/15 pb-5 last:border-0"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-terracotta">
                0{i + 1}
              </span>
              <span className="font-display text-xl md:text-2xl font-light leading-snug">
                {t}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Comentarios() {
  const [comments, setComments] = useState<{ name: string; text: string; date: string }[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const submitFn = useServerFn(submitCadernoMessage);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("bl-comments");
      if (stored) setComments(JSON.parse(stored));
    } catch {}
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || status === "sending") return;
    setStatus("sending");
    try {
      await submitFn({ data: { nome: name.trim(), texto: text.trim() } });
      const next = [
        { name: name.trim(), text: text.trim(), date: new Date().toLocaleDateString("pt-BR") },
        ...comments,
      ].slice(0, 30);
      setComments(next);
      try { localStorage.setItem("bl-comments", JSON.stringify(next)); } catch {}
      setName("");
      setText("");
      setStatus("sent");
      setTimeout(() => setStatus("idle"), 4000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-6 md:px-10">
        <div className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            v. caderno aberto
          </p>
          <h2 className="mt-4 font-display font-light text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-2xl">
            Deixe uma <span className="display-italic text-terracotta">palavra</span>.
          </h2>
          <p className="mt-4 font-body text-base md:text-lg text-ink/70 max-w-xl">
            Um espaço para quem quiser deixar um pensamento, uma pergunta, uma
            ressonância. Sem julgamento.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-12 gap-4 mb-12">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="seu nome ou um pseudônimo"
            className="col-span-12 md:col-span-4 bg-transparent border-b border-border focus:border-ink outline-none py-3 font-body text-base placeholder:text-muted-foreground/70"
            maxLength={40}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="escreva aqui…"
            rows={2}
            className="col-span-12 md:col-span-6 bg-transparent border-b border-border focus:border-ink outline-none py-3 font-body text-base resize-none placeholder:text-muted-foreground/70"
            maxLength={400}
          />
          <button
            type="submit"
            className="col-span-12 md:col-span-2 font-mono text-[11px] uppercase tracking-[0.22em] border border-ink text-ink py-3 hover:bg-ink hover:text-cream transition-colors"
          >
            Enviar
          </button>
        </form>

        <div className="space-y-6">
          {comments.length === 0 && (
            <p className="font-display italic text-muted-foreground text-lg">
              Ainda nenhuma palavra. Seja a primeira a deixar a sua.
            </p>
          )}
          {comments.map((c, i) => (
            <article key={i} className="border-l-2 border-sage pl-5 py-1">
              <p className="font-body text-lg leading-relaxed text-ink/90">"{c.text}"</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                — {c.name} · {c.date}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contato() {
  return (
    <section id="contato" className="py-24 md:py-36 bg-ink text-cream relative overflow-hidden">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 relative">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-cream/50">
          vi. contato
        </p>
        <h2 className="mt-6 font-display font-light text-[clamp(2.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.03em] max-w-5xl">
          Quando estiver pronta,
          <br />
          <span className="display-italic text-terracotta">venha conversar</span>.
        </h2>

        <div className="mt-16 grid grid-cols-12 gap-8 border-t border-cream/15 pt-12">
          <div className="col-span-12 md:col-span-6">
            <p className="font-body text-lg leading-relaxed text-cream/80 max-w-md">
              Agendamentos pelo WhatsApp. Sessões online, em português, para
              brasileiras em qualquer parte do mundo.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3 bg-cream text-ink px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] hover:bg-terracotta hover:text-cream transition-colors"
              >
                WhatsApp
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href={SUBSTACK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 border border-cream/40 text-cream px-7 py-4 font-mono text-[11px] uppercase tracking-[0.22em] hover:border-cream transition-colors"
              >
                Leia no Substack
              </a>
            </div>
          </div>
          <ul className="col-span-12 md:col-span-5 md:col-start-8 space-y-5 font-body">
            {[
              ["Modalidade", "Online · individual"],
              ["Idioma", "Português"],
              ["Frequência", "Semanal, definida a dois"],
              ["Valores", "Por pacote ou avulso, caso a caso"],
            ].map(([k, v]) => (
              <li key={k} className="flex items-baseline justify-between gap-6 border-b border-cream/10 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream/50">
                  {k}
                </span>
                <span className="font-display text-lg text-cream text-right">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-ink text-cream/60 border-t border-cream/10">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="font-display text-2xl text-cream">
          Bárbara<span className="display-italic"> Luiza</span>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.24em]">
          <a href={LINKTREE_URL} target="_blank" rel="noreferrer" className="hover:text-cream">
            Linktree
          </a>
          <a href={SUBSTACK_URL} target="_blank" rel="noreferrer" className="hover:text-cream">
            Substack
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-cream">
            WhatsApp
          </a>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em]">
          CRP 04/65357 · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <main className="bg-cream text-ink min-h-screen">
      <Nav />
      <Hero />
      <Marquee />
      <Escuta />
      <Metodo />
      <Sobre />
      <ParaQuem />
      <Comentarios />
      <Contato />
      <Footer />
    </main>
  );
}
