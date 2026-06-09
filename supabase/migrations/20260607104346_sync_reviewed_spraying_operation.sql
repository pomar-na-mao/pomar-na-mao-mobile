create unique index if not exists uq_field_operations_device_local
  on public.field_operations (device_id, local_id)
  where device_id is not null and local_id is not null;

create unique index if not exists uq_track_points_device_local
  on public.field_operation_track_points (device_id, local_id)
  where device_id is not null and local_id is not null;

create unique index if not exists uq_routes_device_local
  on public.field_operation_routes (device_id, local_id)
  where device_id is not null and local_id is not null;

create unique index if not exists uq_operation_inputs_device_local
  on public.operation_inputs (device_id, local_id)
  where device_id is not null and local_id is not null;

create unique index if not exists uq_plant_operation_history_device_local
  on public.plant_operation_history (device_id, local_id)
  where device_id is not null and local_id is not null;

create or replace function public.sync_reviewed_spraying_operation(
  p_payload jsonb
)
returns table (
  field_operation_id uuid,
  route_id uuid,
  track_points_count integer,
  inputs_count integer,
  confirmed_plants_count integer,
  synced_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation jsonb := p_payload->'operation';
  v_route jsonb := p_payload->'route';
  v_track_point jsonb;
  v_input jsonb;
  v_confirmed_plant jsonb;
  v_operation_type_id uuid;
  v_field_operation_id uuid;
  v_route_id uuid;
  v_nearest_track_point_id bigint;
  v_local_operation_id text := nullif(p_payload->>'localOperationId', '');
  v_device_id text := nullif(p_payload->>'deviceId', '');
  v_zone_id uuid;
  v_started_at timestamptz;
  v_finished_at timestamptz;
  v_synced_at timestamptz := now();
  v_track_points_count integer := 0;
  v_inputs_count integer := 0;
  v_confirmed_plants_count integer := 0;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Payload de Pulverização invalido';
  end if;

  if v_local_operation_id is null or v_device_id is null then
    raise exception 'localOperationId e deviceId sao obrigatorios';
  end if;

  if v_operation is null or jsonb_typeof(v_operation) <> 'object' then
    raise exception 'operation e obrigatoria';
  end if;

  if v_route is null or jsonb_typeof(v_route) <> 'object' then
    raise exception 'route e obrigatoria';
  end if;

  if jsonb_typeof(coalesce(p_payload->'trackPoints', 'null'::jsonb)) <> 'array'
     or jsonb_array_length(p_payload->'trackPoints') < 2 then
    raise exception 'A rota precisa de pelo menos dois pontos GPS';
  end if;

  if jsonb_typeof(coalesce(p_payload->'inputs', 'null'::jsonb)) <> 'array'
     or jsonb_array_length(p_payload->'inputs') < 1 then
    raise exception 'Ao menos um insumo e obrigatorio';
  end if;

  if jsonb_typeof(coalesce(p_payload->'confirmedPlants', 'null'::jsonb)) <> 'array' then
    raise exception 'confirmedPlants precisa ser um array';
  end if;

  v_zone_id := nullif(v_operation->>'zoneId', '')::uuid;
  v_started_at := nullif(v_operation->>'startedAt', '')::timestamptz;
  v_finished_at := nullif(v_operation->>'finishedAt', '')::timestamptz;

  if v_zone_id is null
     or v_started_at is null
     or v_finished_at is null
     or nullif(v_operation->>'operatorName', '') is null then
    raise exception 'Zona, periodo e operador sao obrigatorios';
  end if;

  if v_finished_at < v_started_at then
    raise exception 'finishedAt nao pode ser anterior a startedAt';
  end if;

  perform 1
  from public.zones
  where id = v_zone_id;

  if not found then
    raise exception 'Zona nao encontrada';
  end if;

  select id
    into v_operation_type_id
  from public.operation_types
  where code = 'spraying';

  if v_operation_type_id is null then
    raise exception 'operation_types.code spraying nao encontrado';
  end if;

  insert into public.field_operations (
    operation_type_id,
    zone_id,
    title,
    source,
    started_at,
    finished_at,
    operator_name,
    machine_name,
    tractor_identifier,
    notes,
    local_id,
    device_id,
    sync_status,
    synced_at,
    updated_at
  )
  values (
    v_operation_type_id,
    v_zone_id,
    nullif(v_operation->>'title', ''),
    'gps_track',
    v_started_at,
    v_finished_at,
    v_operation->>'operatorName',
    nullif(v_operation->>'machineName', ''),
    nullif(v_operation->>'tractorIdentifier', ''),
    nullif(v_operation->>'notes', ''),
    v_local_operation_id,
    v_device_id,
    'synced',
    v_synced_at,
    v_synced_at
  )
  on conflict (device_id, local_id)
    where device_id is not null and local_id is not null
  do update set
    operation_type_id = excluded.operation_type_id,
    zone_id = excluded.zone_id,
    title = excluded.title,
    source = excluded.source,
    started_at = excluded.started_at,
    finished_at = excluded.finished_at,
    operator_name = excluded.operator_name,
    machine_name = excluded.machine_name,
    tractor_identifier = excluded.tractor_identifier,
    notes = excluded.notes,
    sync_status = 'synced',
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at
  returning id into v_field_operation_id;

  delete from public.plant_operation_history
  where field_operation_id = v_field_operation_id;

  delete from public.operation_inputs
  where field_operation_id = v_field_operation_id;

  delete from public.field_operation_routes
  where field_operation_id = v_field_operation_id;

  delete from public.field_operation_track_points
  where field_operation_id = v_field_operation_id;

  for v_track_point in
    select value
    from jsonb_array_elements(p_payload->'trackPoints')
    order by (value->>'recordedAt')::timestamptz, value->>'localId'
  loop
    if nullif(v_track_point->>'localId', '') is null
       or nullif(v_track_point->>'recordedAt', '') is null
       or nullif(v_track_point->>'latitude', '') is null
       or nullif(v_track_point->>'longitude', '') is null then
      raise exception 'Ponto GPS invalido';
    end if;

    insert into public.field_operation_track_points (
      field_operation_id,
      recorded_at,
      latitude,
      longitude,
      speed_mps,
      accuracy_m,
      local_id,
      device_id,
      sync_status,
      synced_at
    )
    values (
      v_field_operation_id,
      (v_track_point->>'recordedAt')::timestamptz,
      (v_track_point->>'latitude')::double precision,
      (v_track_point->>'longitude')::double precision,
      nullif(v_track_point->>'speedMps', '')::numeric,
      nullif(v_track_point->>'accuracyM', '')::numeric,
      v_track_point->>'localId',
      v_device_id,
      'synced',
      v_synced_at
    );

    v_track_points_count := v_track_points_count + 1;
  end loop;

  insert into public.field_operation_routes (
    field_operation_id,
    route,
    distance_meters,
    started_at,
    finished_at,
    local_id,
    device_id,
    sync_status,
    synced_at
  )
  values (
    v_field_operation_id,
    extensions.st_setsrid(
      extensions.st_geomfromgeojson((v_route->'geojson')::text),
      4326
    )::extensions.geography,
    (v_route->>'distanceMeters')::numeric,
    (v_route->>'startedAt')::timestamptz,
    (v_route->>'finishedAt')::timestamptz,
    v_route->>'localId',
    v_device_id,
    'synced',
    v_synced_at
  )
  returning id into v_route_id;

  for v_input in
    select value
    from jsonb_array_elements(p_payload->'inputs')
  loop
    if nullif(v_input->>'localId', '') is null
       or nullif(v_input->>'inputType', '') is null
       or nullif(v_input->>'productName', '') is null then
      raise exception 'Insumo invalido';
    end if;

    insert into public.operation_inputs (
      field_operation_id,
      input_type,
      product_name,
      active_ingredient,
      dose,
      dose_unit,
      total_quantity,
      total_quantity_unit,
      notes,
      local_id,
      device_id,
      sync_status,
      synced_at
    )
    values (
      v_field_operation_id,
      v_input->>'inputType',
      v_input->>'productName',
      nullif(v_input->>'activeIngredient', ''),
      nullif(v_input->>'dose', '')::numeric,
      nullif(v_input->>'doseUnit', ''),
      nullif(v_input->>'totalQuantity', '')::numeric,
      nullif(v_input->>'totalQuantityUnit', ''),
      nullif(v_input->>'notes', ''),
      v_input->>'localId',
      v_device_id,
      'synced',
      v_synced_at
    );

    v_inputs_count := v_inputs_count + 1;
  end loop;

  for v_confirmed_plant in
    select value
    from jsonb_array_elements(p_payload->'confirmedPlants')
  loop
    if nullif(v_confirmed_plant->>'localId', '') is null
       or nullif(v_confirmed_plant->>'plantId', '') is null
       or coalesce(v_confirmed_plant->>'matchSource', '') not in ('auto_matched', 'manual_added') then
      raise exception 'Planta confirmada invalida';
    end if;

    perform 1
    from public.plants
    where id = (v_confirmed_plant->>'plantId')::uuid
      and zone_id = v_zone_id
      and is_dead = false
      and non_existent = false;

    if not found then
      raise exception 'Planta confirmada nao encontrada ou indisponivel na zona: %',
        v_confirmed_plant->>'plantId';
    end if;

    v_nearest_track_point_id := null;
    if nullif(v_confirmed_plant->>'nearestTrackPointLocalId', '') is not null then
      select id
        into v_nearest_track_point_id
      from public.field_operation_track_points
      where field_operation_id = v_field_operation_id
        and local_id = v_confirmed_plant->>'nearestTrackPointLocalId'
      limit 1;
    end if;

    insert into public.plant_operation_history (
      plant_id,
      field_operation_id,
      operation_type_id,
      matched_at,
      nearest_track_point_id,
      distance_meters,
      match_source,
      status,
      notes,
      local_id,
      device_id,
      sync_status,
      synced_at
    )
    values (
      (v_confirmed_plant->>'plantId')::uuid,
      v_field_operation_id,
      v_operation_type_id,
      nullif(v_confirmed_plant->>'matchedAt', '')::timestamptz,
      v_nearest_track_point_id,
      nullif(v_confirmed_plant->>'distanceMeters', '')::numeric,
      v_confirmed_plant->>'matchSource',
      'confirmed',
      nullif(v_confirmed_plant->>'notes', ''),
      v_confirmed_plant->>'localId',
      v_device_id,
      'synced',
      v_synced_at
    );

    v_confirmed_plants_count := v_confirmed_plants_count + 1;
  end loop;

  return query
  select
    v_field_operation_id,
    v_route_id,
    v_track_points_count,
    v_inputs_count,
    v_confirmed_plants_count,
    v_synced_at;
end;
$$;

revoke all on function public.sync_reviewed_spraying_operation(jsonb)
  from public;

grant execute on function public.sync_reviewed_spraying_operation(jsonb)
  to anon, authenticated, service_role;
