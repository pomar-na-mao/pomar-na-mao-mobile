begin;

alter table public.plants
  add column if not exists gps_accuracy_m numeric(10, 3);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'plants_gps_accuracy_m_valid'
      and conrelid = 'public.plants'::regclass
  ) then
    alter table public.plants
      add constraint plants_gps_accuracy_m_valid
      check (gps_accuracy_m is null or gps_accuracy_m between 0 and 5);
  end if;
end $$;

create or replace function private.sync_new_plant_impl(p_payload jsonb)
returns table (
  plant_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  synced_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_local_id text := nullif(btrim(p_payload->>'localId'), '');
  v_device_id text := nullif(btrim(p_payload->>'deviceId'), '');
  v_latitude double precision;
  v_longitude double precision;
  v_gps_accuracy_m numeric(10, 3);
  v_gps_timestamp bigint;
  v_variety_id bigint;
  v_zone_id uuid;
  v_planting_date timestamptz;
  v_synced_at timestamptz := clock_timestamp();
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception using errcode = '22023', message = 'Payload de planta invalido.';
  end if;

  if v_local_id is null or v_device_id is null then
    raise exception using errcode = '22023', message = 'localId e deviceId sao obrigatorios.';
  end if;

  begin
    v_latitude := (p_payload->>'latitude')::double precision;
    v_longitude := (p_payload->>'longitude')::double precision;
    v_gps_accuracy_m := nullif(p_payload->>'gpsAccuracyM', '')::numeric(10, 3);
    v_gps_timestamp := nullif(p_payload->>'gpsTimestamp', '')::bigint;
    v_variety_id := (p_payload->>'varietyId')::bigint;
    v_zone_id := (p_payload->>'zoneId')::uuid;
    v_planting_date := (p_payload->>'plantingDate')::timestamptz;
  exception
    when invalid_text_representation or datetime_field_overflow or numeric_value_out_of_range then
      raise exception using errcode = '22023', message = 'Tipos invalidos no payload da planta.';
  end;

  if v_latitude is null or v_latitude < -90 or v_latitude > 90 then
    raise exception using errcode = '22023', message = 'Latitude invalida.';
  end if;
  if v_longitude is null or v_longitude < -180 or v_longitude > 180 then
    raise exception using errcode = '22023', message = 'Longitude invalida.';
  end if;
  if v_gps_accuracy_m is not null and (v_gps_accuracy_m < 0 or v_gps_accuracy_m > 5) then
    raise exception using errcode = '22023', message = 'Precisao GPS deve ser de ate 5 metros.';
  end if;
  if v_gps_timestamp is not null and v_gps_timestamp <= 0 then
    raise exception using errcode = '22023', message = 'Timestamp GPS invalido.';
  end if;
  if v_variety_id is null or v_zone_id is null or v_planting_date is null then
    raise exception using errcode = '22023', message = 'Variedade, zona e data de plantio sao obrigatorias.';
  end if;

  if not exists (select 1 from public.varieties v where v.id = v_variety_id) then
    raise exception using errcode = '23503', message = 'Variedade informada nao existe.';
  end if;
  if not exists (select 1 from public.zones z where z.id = v_zone_id) then
    raise exception using errcode = '23503', message = 'Zona informada nao existe.';
  end if;

  return query
  insert into public.plants (
    latitude,
    longitude,
    gps_accuracy_m,
    gps_timestamp,
    variety_id,
    zone_id,
    planting_date,
    is_dead,
    is_new,
    non_existent,
    local_id,
    device_id,
    sync_status,
    synced_at,
    created_at,
    updated_at
  ) values (
    v_latitude,
    v_longitude,
    v_gps_accuracy_m,
    v_gps_timestamp,
    v_variety_id,
    v_zone_id,
    v_planting_date,
    false,
    true,
    false,
    v_local_id,
    v_device_id,
    'synced',
    v_synced_at,
    v_synced_at,
    v_synced_at
  )
  on conflict (device_id, local_id)
    where device_id is not null and local_id is not null
  do update set
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    gps_accuracy_m = excluded.gps_accuracy_m,
    gps_timestamp = excluded.gps_timestamp,
    variety_id = excluded.variety_id,
    zone_id = excluded.zone_id,
    planting_date = excluded.planting_date,
    is_dead = false,
    is_new = true,
    non_existent = false,
    sync_status = 'synced',
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at
  returning plants.id, plants.created_at, plants.updated_at, plants.synced_at;
end;
$$;

comment on column public.plants.gps_accuracy_m is
  'Raio de incerteza horizontal informado pelo dispositivo no cadastro da planta, em metros.';

comment on function public.sync_new_plant(jsonb) is
  'Sincroniza planta offline com coordenadas, precisao e timestamp da leitura GPS.';

commit;
