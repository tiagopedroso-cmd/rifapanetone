-- Função exclusiva da página pública. Mantém a função administrativa intacta.
create or replace function public.public_create_reservation(
  p_campaign_id uuid,
  p_full_name text,
  p_phone text,
  p_numbers smallint[]
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_count integer;
  v_price integer;
  v_minutes integer;
  v_status public.campaign_status;
  v_reservation uuid;
  v_created timestamptz := clock_timestamp();
begin
  if p_full_name is null or char_length(btrim(p_full_name)) not between 3 and 180
    or p_phone is null or p_phone !~ E'^\\+?[0-9]{10,15}$' then
    raise exception 'Dados do participante invalidos';
  end if;

  v_count := coalesce(array_length(p_numbers, 1), 0);
  if v_count not between 1 and 100
    or exists (select 1 from unnest(p_numbers) n where n is null or n not between 1 and 100)
    or (select count(distinct n) from unnest(p_numbers) n) <> v_count then
    raise exception 'Informe de 1 a 100 numeros distintos entre 1 e 100';
  end if;

  -- Serializa reservas por campanha e impede dupla reserva em concorrência.
  select status, reservation_minutes,
    case when v_count = 1 then price_single_cents else price_multi_cents end
  into v_status, v_minutes, v_price
  from public.campaigns
  where id = p_campaign_id
  for update;

  if not found or v_status <> 'simulation' then
    raise exception 'Campanha nao disponivel para simulacao';
  end if;

  if (select count(*) from public.campaign_numbers
      where campaign_id = p_campaign_id and number = any(p_numbers)) <> v_count then
    raise exception 'Numero inexistente na campanha';
  end if;

  if exists (select 1 from public.number_holdings
      where campaign_id = p_campaign_id and number = any(p_numbers)) then
    raise exception 'Um ou mais numeros estao indisponiveis';
  end if;

  with participant as (
    insert into public.participants(full_name, phone)
    values (btrim(p_full_name), p_phone)
    returning id
  )
  insert into public.reservations(campaign_id, participant_id, status, total_cents, created_at, expires_at)
  select p_campaign_id, id, 'pending', v_count * v_price, v_created,
    v_created + make_interval(mins => v_minutes)
  from participant
  returning id into v_reservation;

  insert into public.reservation_numbers(reservation_id, campaign_id, number)
  select v_reservation, p_campaign_id, n from unnest(p_numbers) n;

  insert into public.number_holdings(campaign_id, number, reservation_id)
  select p_campaign_id, n, v_reservation from unnest(p_numbers) n;

  insert into public.payment_records(reservation_id, status, amount_cents)
  values (v_reservation, 'simulated_pending', v_count * v_price);

  return v_reservation;
end
$function$;

grant execute on function public.public_create_reservation(uuid, text, text, smallint[]) to anon, authenticated;
