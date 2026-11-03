import Link from "next/link";

const campaigns = [
  { eyebrow: "CAMPANHA 01", title: "2 TORTAS", detail: "1 torta de limão + 1 Banoffee", icon: "🍋", color: "from-[#fff3c8] via-[#fff9eb] to-[#e3f5d2]", accent: "text-[#759841]" },
  { eyebrow: "CAMPANHA 02", title: "PANETONE", detail: "Panetone trufado", icon: "🍫", color: "from-[#f4ddc4] via-[#fff5ec] to-[#e8c69b]", accent: "text-[#8c4e24]", href: "/panetone" },
];

export default function Home() {
  return <main className="min-h-screen bg-[#fffaf5] text-[#352218]">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10"><span className="rounded-full bg-[#352218] px-4 py-2 text-xs font-black tracking-[0.16em] text-[#fffaf5]">MEGA RIFA</span><Link href="/login" className="text-xs font-bold tracking-[0.16em] text-[#76533f] transition hover:text-[#352218]">ACESSO ADMINISTRATIVO</Link></header>
    <section className="mx-auto max-w-6xl px-6 pb-14 pt-12 sm:px-10 sm:pt-20"><p className="text-xs font-black tracking-[0.2em] text-[#b36835]">PRÊMIOS FEITOS PARA COMPARTILHAR</p><h1 className="mt-5 max-w-3xl font-[Georgia,serif] text-5xl font-bold leading-[0.96] tracking-tight sm:text-7xl">Duas campanhas deliciosas estão chegando.</h1><p className="mt-6 max-w-xl text-base leading-7 text-[#76533f] sm:text-lg">Escolha sua rifa favorita e participe. Os layouts e os detalhes de participação serão publicados em breve.</p></section>
    <section className="mx-auto grid max-w-6xl gap-5 px-6 pb-16 sm:grid-cols-2 sm:px-10">{campaigns.map((campaign) => <article key={campaign.title} className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${campaign.color} p-8 shadow-[0_16px_50px_#5a32151c] sm:p-10`}><span className="absolute -right-5 -top-7 text-9xl opacity-25" aria-hidden="true">{campaign.icon}</span><p className={`text-xs font-black tracking-[0.2em] ${campaign.accent}`}>{campaign.eyebrow}</p><h2 className="mt-8 font-[Georgia,serif] text-5xl font-bold tracking-tight">{campaign.title}</h2><p className="mt-3 text-lg font-semibold text-[#583827]">{campaign.detail}</p>{campaign.href ? <Link href={campaign.href} className="mt-12 inline-block rounded-full bg-[#583827] px-4 py-2 text-xs font-bold tracking-wide text-white transition hover:bg-[#352218]">VER CAMPANHA →</Link> : <span className="mt-12 inline-block rounded-full border border-[#583827]/20 bg-white/50 px-4 py-2 text-xs font-bold tracking-wide text-[#583827]">LAYOUT EM PREPARAÇÃO</span>}</article>)}</section>
    <footer className="border-t border-[#d8bfae]/60 px-6 py-7 text-center text-xs text-[#76533f]">Ambiente de simulação — pagamentos reais ainda não estão habilitados.</footer>
  </main>;
}
