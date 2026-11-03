
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CAMPAIGN_ID =
  "ca4fcc0f-32b3-48a9-a5c2-7036c6e9138e";

export default function TestesPage() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [occupied, setOccupied] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [reserving, setReserving] = useState(false);
  const [message, setMessage] = useState("Carregando números...");

  const totalCents =
    selected.length === 1
      ? 2000
      : selected.length * 1500;

  async function loadNumbers() {
    const { data: availableData, error: numbersError } =
      await supabase
        .from("campaign_numbers")
        .select("number")
        .eq("campaign_id", CAMPAIGN_ID)
        .order("number");

    if (numbersError) {
      setMessage(`Erro: ${numbersError.message}`);
      return;
    }

    const { data: occupiedData, error: occupiedError } =
      await supabase
        .from("number_holdings")
        .select("number")
        .eq("campaign_id", CAMPAIGN_ID);

    if (occupiedError) {
      setMessage(`Erro: ${occupiedError.message}`);
      return;
    }

    setNumbers(availableData?.map((item) => item.number) ?? []);

    const blocked =
      occupiedData?.map((item) => item.number) ?? [];

    setOccupied(blocked);

    setSelected((current) =>
      current.filter((number) => !blocked.includes(number))
    );

    setMessage("Números carregados com sucesso!");
  }

  useEffect(() => {
    void loadNumbers();
  }, []);

  function toggleNumber(number: number) {
    if (occupied.includes(number) || reserving) return;

    setSelected((current) =>
      current.includes(number)
        ? current.filter((n) => n !== number)
        : [...current, number]
    );
  }

  async function createTestReservation() {
    if (selected.length === 0 || reserving) return;

    setReserving(true);
    setMessage("Criando reserva simulada...");

    try {
      const { data, error } = await supabase.rpc(
        "sim_create_reservation",
        {
          p_campaign_id: CAMPAIGN_ID,
          p_full_name: "Participante Teste",
          p_phone: "11999999999",
          p_numbers: selected,
        }
      );


if (error) {
  console.error("Erro ao reservar:", error);

  const conflict =
    /ocupad|indispon|reservad|bloquead|conflit|duplicate|unique/i.test(
      error.message
    ) || error.code === "23505";

  window.alert(
    conflict
      ? "Este número já está reservado. Escolha outro número disponível."
      : `Não foi possível criar a reserva: ${error.message}`
  );

  setMessage(
    conflict
      ? "Reserva recusada: número indisponível."
      : `Erro na reserva: ${error.message}`
  );

  return;
}


      setSelected([]);

      await loadNumbers();

      setMessage(
        `Reserva simulada criada com sucesso! ID: ${data}`
      );
    } catch {
      setMessage("Erro inesperado ao criar reserva.");
    } finally {
      setReserving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-2xl font-bold">
          Teste de Disponibilidade
        </h1>

        <p className="mb-6 text-sm text-slate-400">
          Campanha Feminina — Simulação
        </p>

        <p role="status" className="mb-6">
          {message}
        </p>

        <div className="mb-5 flex flex-wrap gap-5 text-sm">
          <span>
            Disponíveis: {numbers.length - occupied.length}
          </span>

          <span>
            Ocupados: {occupied.length}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <span className="text-emerald-400">
            ● Disponível
          </span>

          <span className="text-blue-400">
            ● Selecionado
          </span>

          <span className="text-red-400">
            ● Ocupado
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {numbers.map((number) => {
            const unavailable = occupied.includes(number);
            const isSelected = selected.includes(number);

            return (
              <button
                key={number}
                type="button"
                disabled={unavailable || reserving}
                onClick={() => toggleNumber(number)}
                aria-pressed={isSelected}
                className={`rounded-lg p-3 text-center font-semibold ${
                  unavailable
                    ? "cursor-not-allowed bg-red-900 text-red-200"
                    : isSelected
                    ? "bg-blue-600 text-white"
                    : "bg-emerald-800 text-white hover:bg-emerald-700"
                }`}
              >
                {number}
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-slate-700 p-5">
          <h2 className="mb-4 text-xl font-bold">
            Reserva simulada
          </h2>

          <p className="mb-2 text-slate-300">
            Números selecionados: {selected.length}
          </p>

          <p className="mb-2 text-sm text-slate-400">
            {selected.length > 0
              ? [...selected].sort((a, b) => a - b).join(", ")
              : "Nenhum número selecionado"}
          </p>

          <p className="mb-4 text-3xl font-bold">
            {(totalCents / 100).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>

          <p className="mb-5 text-sm text-slate-400">
            Prazo de reserva: 2 horas
          </p>

          <button
            type="button"
            onClick={createTestReservation}
            disabled={selected.length === 0 || reserving}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {reserving
              ? "Reservando..."
              : "Criar reserva simulada"}
          </button>
        </div>
      </div>
    </main>
  );
}
