
"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reservation = {
  id: string;
  campaign_id: string;
  status: string;
  total_cents: number;
  created_at: string;
  expires_at: string;
  full_name: string | null;
  phone: string | null;
  numbers: number[];
};

const campaigns = [
  {
    id: "ca4fcc0f-32b3-48a9-a5c2-7036c6e9138e",
    name: "Torta",
  },
  {
    id: "5d1dc89d-8836-4ba2-9116-ac7ad300c6d6",
    name: "Panetone",
  },
];

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  expired_review: "Aguardando revisão",
  confirmed: "Confirmada (simulação)",
  cancelled: "Cancelada",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-900 text-amber-200",
  expired_review: "bg-orange-900 text-orange-200",
  confirmed: "bg-emerald-900 text-emerald-200",
  cancelled: "bg-red-900 text-red-200",
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function ReservasPage() {
  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [campaignFilter, setCampaignFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [checkingExpired, setCheckingExpired] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: queryError } = await supabase.rpc(
        "admin_list_reservations"
      );

      if (queryError) {
        setError(queryError.message);
        return false;
      }

      setReservations((data ?? []) as Reservation[]);
      return true;
    } catch {
      setError("Erro inesperado ao carregar reservas.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  async function reviewReservation(
    reservationId: string,
    decision: "confirm_simulated" | "release"
  ) {
    if (processingId !== null || checkingExpired || loading) {
      return;
    }

    const confirmed = window.confirm(
      decision === "confirm_simulated"
        ? "Confirmar esta reserva na simulação?"
        : "Cancelar esta reserva e liberar seus números?"
    );

    if (!confirmed) return;

    setProcessingId(reservationId);
    setActionMessage("");

    try {
      const { error: reviewError } = await supabase.rpc(
        "sim_review_reservation",
        {
          p_reservation_id: reservationId,
          p_decision: decision,
        }
      );

      if (reviewError) {
        setActionMessage(
          `Erro ao revisar reserva: ${reviewError.message}`
        );
        return;
      }

      const refreshed = await loadReservations();

      if (!refreshed) {
        setActionMessage(
          "Operação executada, mas não foi possível atualizar a lista. Consulte o banco antes de repetir."
        );
        return;
      }

      setActionMessage(
        decision === "confirm_simulated"
          ? "Reserva confirmada na simulação!"
          : "Reserva cancelada e números liberados!"
      );
    } catch {
      setActionMessage(
        "Erro inesperado. Consulte o banco antes de repetir a operação."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function checkExpiredReservations() {
    if (processingId !== null || checkingExpired || loading) {
      return;
    }

    setCheckingExpired(true);
    setActionMessage("Verificando reservas vencidas...");

    try {
      const { data, error: checkError } = await supabase.rpc(
        "sim_mark_expired_for_review"
      );

      if (checkError) {
        setActionMessage(
          `Erro ao verificar vencimentos: ${checkError.message}`
        );
        return;
      }

      const refreshed = await loadReservations();

      if (!refreshed) {
        setActionMessage(
          `${data ?? 0} reserva(s) processada(s), mas houve erro ao atualizar a lista.`
        );
        return;
      }

      setActionMessage(
        `${data ?? 0} reserva(s) encaminhada(s) para revisão.`
      );
    } catch {
      setActionMessage(
        "Erro inesperado ao verificar vencimentos."
      );
    } finally {
      setCheckingExpired(false);
    }
  }

  const filtered = reservations.filter((reservation) => {
    const matchesCampaign =
      campaignFilter === "all" ||
      reservation.campaign_id === campaignFilter;

    const matchesStatus =
      statusFilter === "all" ||
      reservation.status === statusFilter;

    return matchesCampaign && matchesStatus;
  });

  const pendingCount = reservations.filter(
    (r) => r.status === "pending"
  ).length;

  const expiredCount = reservations.filter(
    (r) => r.status === "expired_review"
  ).length;

  const confirmedCount = reservations.filter(
    (r) => r.status === "confirmed"
  ).length;

  const totalConfirmedCents = reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.total_cents, 0);

  function getCampaignName(id: string) {
    return (
      campaigns.find((item) => item.id === id)?.name ??
      "Desconhecida"
    );
  }

  const busy =
    loading || processingId !== null || checkingExpired;

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <div className="mx-auto max-w-6xl">

        {/* CABECALHO */}

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Gestão de Reservas
          </h1>

          <p className="text-slate-400">
            Painel administrativo — Ambiente de simulação
          </p>
        </div>

        {/* RESUMO */}

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Pendentes
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-400">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Aguardando revisão
            </p>
            <p className="mt-2 text-3xl font-bold text-orange-400">
              {expiredCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Confirmadas
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {confirmedCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">
              Total simulado confirmado
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {formatMoney(totalConfirmedCents)}
            </p>
          </div>
        </div>

        {/* MENSAGENS */}

        {actionMessage && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm"
          >
            {actionMessage}
          </div>
        )}

        {/* FILTROS */}

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <select
            value={campaignFilter}
            onChange={(e) =>
              setCampaignFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 p-3"
          >
            <option value="all">
              Todas as campanhas
            </option>

            {campaigns.map((campaign) => (
              <option
                key={campaign.id}
                value={campaign.id}
              >
                Campanha {campaign.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-lg border border-slate-700 bg-slate-800 p-3"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="expired_review">
              Aguardando revisão
            </option>
            <option value="confirmed">
              Confirmadas
            </option>
            <option value="cancelled">
              Canceladas
            </option>
          </select>
        </div>

        {/* ACOES GERAIS */}

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadReservations()}
            disabled={busy}
            className="rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-600 disabled:opacity-50"
          >
            {loading
              ? "Atualizando..."
              : "Atualizar reservas"}
          </button>

          <button
            type="button"
            onClick={() =>
              void checkExpiredReservations()
            }
            disabled={busy}
            className="rounded-lg bg-amber-700 px-5 py-3 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
          >
            {checkingExpired
              ? "Verificando..."
              : "Verificar vencimentos"}
          </button>
        </div>

        {/* ERROS */}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-800 bg-red-950 p-4 text-red-300"
          >
            Erro: {error}
          </div>
        )}

        {/* LISTAGEM */}

        {loading && (
          <p className="text-slate-400">
            Carregando reservas...
          </p>
        )}

        {!loading && !error && (
          <>
            <p className="mb-5 text-sm text-slate-400">
              {filtered.length} reserva(s) encontrada(s)
            </p>

            <div className="space-y-4">
              {filtered.map((reservation) => {
                const canReview = [
                  "pending",
                  "expired_review",
                ].includes(reservation.status);

                const sortedNumbers = [...(reservation.numbers ?? [])].sort(
                  (a, b) => a - b
                );

                const isExpired =
                  new Date(reservation.expires_at).getTime() <=
                  Date.now();

                return (
                  <div
                    key={reservation.id}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-5"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-bold">
                        {reservation.full_name ??
                          "Participante não identificado"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColors[reservation.status] ??
                          "bg-slate-700 text-white"
                        }`}
                      >
                        {statusLabels[reservation.status] ??
                          reservation.status}
                      </span>
                    </div>

                    <p className="mb-1 text-sm text-slate-400">
                      Campanha:{" "}
                      {getCampaignName(
                        reservation.campaign_id
                      )}
                    </p>

                    <p className="mb-1 text-sm">
                      Telefone:{" "}
                      {reservation.phone ?? "—"}
                    </p>

                    <p className="mb-2 text-sm">
                      Números:{" "}
                      {sortedNumbers.length > 0
                        ? sortedNumbers.join(", ")
                        : "Nenhum"}
                    </p>

                    <p className="mt-4 text-2xl font-bold">
                      {formatMoney(
                        reservation.total_cents
                      )}
                    </p>

                    <div className="mt-4 space-y-1 text-xs text-slate-400">
                      <p>
                        Criada em:{" "}
                        {formatDate(
                          reservation.created_at
                        )}
                      </p>

                      <p>
                        Vencimento:{" "}
                        {formatDate(
                          reservation.expires_at
                        )}
                      </p>
                    </div>

                    {isExpired &&
                      reservation.status === "pending" && (
                        <p className="mt-3 rounded-lg bg-amber-950 p-3 text-sm text-amber-300">
                          Prazo encerrado. Execute a verificação
                          de vencimentos para encaminhar
                          esta reserva para revisão.
                        </p>
                      )}

                    {reservation.status ===
                      "expired_review" && (
                      <p className="mt-3 rounded-lg bg-orange-950 p-3 text-sm text-orange-300">
                        Reserva vencida. Os números permanecem
                        bloqueados até a decisão administrativa.
                      </p>
                    )}

                    {/* ACOES ADMINISTRATIVAS */}

                    {canReview && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void reviewReservation(
                              reservation.id,
                              "confirm_simulated"
                            )
                          }
                          className="rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {processingId === reservation.id
                            ? "Processando..."
                            : "Confirmar simulação"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void reviewReservation(
                              reservation.id,
                              "release"
                            )
                          }
                          className="rounded-lg bg-red-800 px-5 py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                        >
                          Cancelar e liberar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-xl border border-slate-700 bg-slate-900 p-8 text-center text-slate-400">
                  Nenhuma reserva encontrada.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
