-- Permite que visitantes criem uma reserva pela página pública.
-- A função já deve validar disponibilidade e criar participant, reservation
-- e number_holdings em uma única transação.
grant execute on function public.sim_create_reservation(uuid, text, text, integer[]) to anon, authenticated;
