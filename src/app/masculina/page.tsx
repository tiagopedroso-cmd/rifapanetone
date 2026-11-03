"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import styles from "./masculina.module.css";

const CAMPAIGN_ID = "5d1dc89d-8836-4ba2-9116-ac7ad300c6d6";
const photos = Array.from({ length: 9 }, (_, i) => `/premio/ferramentas-${String(i + 1).padStart(2, "0")}.webp`);

type Campaign = {
  id: string;
  title: string;
  prize_description: string | null;
  draw_at: string | null;
  price_single_cents: number;
  price_multi_cents: number;
  reservation_minutes: number;
};
type CampaignNumber = { number: number; available: boolean };

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function MasculinaPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [numbers, setNumbers] = useState<CampaignNumber[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);
  const [showNotice, setShowNotice] = useState(false);

  const loadData = useCallback(async () => {
    const [campaignResponse, numberResponse] = await Promise.all([
      supabase.rpc("public_campaigns"),
      supabase.rpc("public_campaign_numbers", { p_campaign_id: CAMPAIGN_ID }),
    ]);
    if (campaignResponse.error || numberResponse.error) {
      throw new Error("Não foi possível consultar os dados da campanha.");
    }
    const found = ((campaignResponse.data ?? []) as Campaign[]).find((item) => item.id === CAMPAIGN_ID);
    if (!found) throw new Error("Esta campanha não está disponível no momento.");
    const loadedNumbers = (numberResponse.data ?? []) as CampaignNumber[];
    setCampaign(found);
    setNumbers(loadedNumbers);
    const available = new Set(loadedNumbers.filter((n) => n.available).map((n) => n.number));
    setSelected((old) => old.filter((n) => available.has(n)));
    setError("");
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadTimer = window.setTimeout(() => {
      void loadData()
        .catch((e: unknown) => {
          if (mounted) setError(e instanceof Error ? e.message : "Erro ao carregar campanha.");
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(loadTimer);
    };
  }, [loadData]);

  async function refresh() {
    setRefreshing(true);
    try { await loadData(); }
    catch (e) { setError(e instanceof Error ? e.message : "Falha ao atualizar."); }
    finally { setRefreshing(false); }
  }

  function toggle(n: number) {
    if (!numbers.find((x) => x.number === n)?.available) return;
    setSelected((old) => old.includes(n) ? old.filter((x) => x !== n) : [...old, n].sort((a, b) => a - b));
  }

  const total = useMemo(() => selected.length * (selected.length === 1 ? (campaign?.price_single_cents ?? 0) : (campaign?.price_multi_cents ?? 0)), [selected, campaign]);
  const availableCount = numbers.filter((n) => n.available).length;
  const drawDate = campaign?.draw_at ? new Date(campaign.draw_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "A definir";

  return (
    <main className={styles.page}>
      <div className={styles.topline}><span>MEGA RIFA</span><strong>CAMPANHA MASCULINA</strong><small>EDIÇÃO ESPECIAL</small></div>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>MEGA RIFA <i /> CAMPANHA MASCULINA</div>
          <h1>KIT DE FERRAMENTAS <em>MULTIFUNCIONAL</em> <small>DE 4 PEÇAS</small></h1>
          <p>Um kit completo para equipar seus projetos. Escolha seus números e participe da campanha.</p>
          <div className={styles.heroFeatures}><span>⚡ POTÊNCIA E DESEMPENHO</span><span>✦ MULTIFUNCIONAL</span><span>🔋 SEM FIO E PORTÁTIL</span><span>✓ PRONTO PARA USAR</span></div>
          <a className={styles.heroCta} href="#numeros">ESCOLHER MEUS NÚMEROS <span>↘</span></a>
          <div className={styles.performance}><strong>KIT COMPLETO DE ALTA PERFORMANCE</strong><span>PARA QUALQUER DESAFIO</span></div>
        </div>
      </section>

      <section className={styles.specs} aria-label="Ferramentas do prêmio">
          <div><span>⚙</span><p><strong>MARTELETE ROTATIVO</strong><small>SDS Plus</small></p></div>
          <div><span>✦</span><p><strong>ESMERILHADEIRA ANGULAR</strong><small>Disco de 125 mm</small></p></div>
        <div><span>🔧</span><p><strong>CHAVE DE IMPACTO</strong><small>Torque anunciado: 550 N·m</small></p></div>
        <div><span>⌁</span><p><strong>FURADEIRA ELÉTRICA</strong><small>Até 2.250 RPM</small></p></div>
      </section>

      <section className={styles.gallerySection}>
        <div className={styles.sectionHeading}><div><span>CONHEÇA O PRÊMIO</span><h2>UM KIT. <em>INÚMERAS POSSIBILIDADES.</em></h2></div><p>Veja as imagens de referência do conjunto anunciado.</p></div>
        <div className={styles.gallery}>
          <div className={styles.galleryMain}><Image src={photos[activePhoto]} alt={`Imagem ${activePhoto + 1} do kit de ferramentas`} fill sizes="(max-width: 850px) 100vw, 60vw" className={styles.galleryImage} /></div>
          <div className={styles.thumbs}>{photos.map((photo, i) => <button key={photo} type="button" onClick={() => setActivePhoto(i)} aria-label={`Ver foto ${i + 1}`} aria-pressed={activePhoto === i} className={`${styles.thumb} ${activePhoto === i ? styles.thumbActive : ""}`}><Image src={photo} alt="" fill sizes="100px" /></button>)}</div>
        </div>
        <p className={styles.imageNote}>Imagens ilustrativas fornecidas para apresentação do prêmio. Confira as características e os itens efetivamente incluídos antes da publicação.</p>
      </section>

      <section id="numeros" className={styles.purchase}>
        <div className={styles.purchaseHead}><div><span className={styles.kicker}>PARTICIPE AGORA</span><h2>ESCOLHA SEUS <em>NÚMEROS</em></h2><p>Selecione um ou mais números disponíveis. A disponibilidade pode mudar até a confirmação da reserva.</p></div><div className={styles.availability}><span className={styles.greenDot} /><strong>{loading ? "..." : availableCount}</strong><span>disponíveis<br />de {numbers.length || 100} números</span></div></div>
        {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={() => void refresh()}>Tentar novamente</button></div>}
        <div className={styles.purchaseGrid}>
          <div className={styles.numberArea}>
            {loading ? <p className={styles.loading}>Carregando números...</p> : <div className={styles.numberGrid}>{numbers.map((item) => { const chosen = selected.includes(item.number); return <button key={item.number} type="button" disabled={!item.available} onClick={() => toggle(item.number)} aria-pressed={chosen} aria-label={`Número ${item.number}, ${!item.available ? "ocupado" : chosen ? "selecionado" : "disponível"}`} className={`${styles.number} ${!item.available ? styles.occupied : chosen ? styles.chosen : ""}`}>{String(item.number).padStart(2, "0")}</button>; })}</div>}
            <div className={styles.legend}><span><i className={styles.legendAvailable} />Disponível</span><span><i className={styles.legendChosen} />Selecionado</span><span><i className={styles.legendOccupied} />Ocupado</span></div>
            <button type="button" className={styles.refresh} disabled={refreshing} onClick={() => void refresh()}>↻ {refreshing ? "Atualizando..." : "Atualizar números"}</button>
          </div>
          <aside className={styles.summary}>
            <div className={styles.summaryTitle}><h3>🛒 SEU CARRINHO</h3><div className={styles.counter}><strong>{selected.length}</strong><span>{selected.length === 1 ? "número" : "números"}</span></div></div>
            <div className={styles.rule} />
            <div className={styles.labelRow}><strong>Números escolhidos</strong><button type="button" onClick={() => setSelected([])} disabled={!selected.length}>× Limpar</button></div>
            <div className={styles.chips}>{selected.length ? selected.map((n) => <button type="button" key={n} onClick={() => toggle(n)} title={`Remover número ${n}`}>{String(n).padStart(2, "0")} ×</button>) : <p>Nenhum número selecionado ainda.</p>}</div>
            <div className={styles.rule} />
            <div className={styles.priceLine}><span>1 número</span><strong>{brl(campaign?.price_single_cents ?? 2000)}</strong></div>
            <div className={styles.priceLine}><span>2 ou mais (cada)</span><strong>{brl(campaign?.price_multi_cents ?? 1500)}</strong></div>
            <div className={styles.rule} />
            <div className={styles.total}><span>TOTAL</span><strong>{brl(total)}</strong></div>
            <button type="button" className={styles.reserveButton} disabled={!selected.length || !!error} onClick={() => setShowNotice(true)}>CONTINUAR PARA PAGAMENTO <span>➜</span></button>
            <div className={styles.holdInfo}>🔒 Após a criação da reserva, você terá {campaign?.reservation_minutes ?? 120} minutos para pagar.</div>
            {showNotice && <div className={styles.notice} role="status"><button type="button" onClick={() => setShowNotice(false)} aria-label="Fechar aviso">×</button><strong>Seleção pronta!</strong><p>A identificação e a reserva segura serão habilitadas na próxima etapa. Nenhum número foi reservado nem pagamento foi processado.</p></div>}
          </aside>
        </div>
      </section>

      <section className={styles.benefits}><div>🛡️ <strong>COMPRA SEGURA</strong><small>Seus dados protegidos</small></div><div>◷ <strong>RESERVA POR 2 HORAS</strong><small>Tempo para realizar o pagamento</small></div><div>🎟️ <strong>ACOMPANHE SUA COMPRA</strong><small>Consulte sua reserva</small></div><div>★ <strong>BOA SORTE!</strong><small>Escolha seus números e participe</small></div></section>
      <section className={styles.how}><span className={styles.kicker}>É SIMPLES PARTICIPAR</span><h2>COMO FUNCIONA?</h2><div className={styles.steps}><div><b>1</b><strong>Escolha seus números</strong><p>Selecione os números disponíveis.</p></div><div><b>2</b><strong>Preencha seus dados</strong><p>Informe nome e WhatsApp, sem criar conta.</p></div><div><b>3</b><strong>Realize o pagamento</strong><p>Após reservar, você terá até 2 horas.</p></div><div><b>4</b><strong>Aguarde a confirmação</strong><p>A participação será confirmada após a validação do pagamento.</p></div></div></section>
      <footer className={styles.footer}><div><span>▦</span><p><strong>DATA DO SORTEIO</strong><small>{drawDate} (Brasília)</small></p></div><div><span>🎟</span><p><strong>VALOR DOS NÚMEROS</strong><small>1 número: {brl(campaign?.price_single_cents ?? 2000)}<br />2 ou mais: {brl(campaign?.price_multi_cents ?? 1500)} cada</small></p></div><div><span>🎁</span><p><strong>PRÊMIO</strong><small>Kit de Ferramentas Multifuncional de 4 Peças — MOHOR 48V<br />Furadeira, impacto, martelete SDS Plus e esmerilhadeira.</small></p></div></footer>
      <div className={styles.disclaimer}>Página em ambiente de simulação. Reservas e pagamentos reais ainda não estão habilitados.</div>
    </main>
  );
}
