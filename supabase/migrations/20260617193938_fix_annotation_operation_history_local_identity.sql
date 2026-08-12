create or replace function public.create_occurrence_annotation(
  p_occurrence_type_id uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_zone_id uuid default null,
  p_notes text default null,
  p_severity text default null,
  p_gps_accuracy_m numeric default null,
  p_max_distance_meters double precision default null,
  p_device_id text default null,
  p_local_id text default null,
  p_field_operation_local_id text default null,
  p_plant_id uuid default null,
  p_assigned_distance_meters numeric default null,
  p_assignment_method text default 'nearest_plant',
  p_assignment_status text default 'confirmed',
  p_observed_at timestamptz default now()
)
returns table (
  field_operation_id uuid,
  occurrence_id uuid,
  plant_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plant_id uuid;
  v_distance_meters numeric;
  v_operation_type_id uuid;
  v_field_operation_id uuid;
  v_occurrence public.plant_occurrences%rowtype;
  v_existing_event public.plant_occurrence_events%rowtype;
  v_zone_id uuid;
  v_assignment_method text := coalesce(p_assignment_method, 'nearest_plant');
  v_assignment_status text := coalesce(p_assignment_status, 'confirmed');
  v_observed_at timestamptz := coalesce(p_observed_at, now());
  v_field_operation_local_id text := coalesce(p_field_operation_local_id, p_local_id);
begin
  if p_device_id is not null and p_local_id is not null then
    select poe.*
      into v_existing_event
    from public.plant_occurrence_events poe
    where poe.device_id = p_device_id
      and poe.local_change_id = p_local_id
    limit 1;

    if v_existing_event.id is not null then
      return query
      select
        v_existing_event.field_operation_id,
        v_existing_event.occurrence_id,
        v_existing_event.plant_id;
      return;
    end if;
  end if;

  if v_assignment_method not in ('manual', 'nearest_plant', 'corrected_by_user', 'polygon_bulk') then
    raise exception 'Metodo de atribuicao invalido: %', v_assignment_method;
  end if;

  if v_assignment_status not in ('pending_review', 'confirmed', 'rejected') then
    raise exception 'Status de atribuicao invalido: %', v_assignment_status;
  end if;

  if p_plant_id is not null then
    select p.id, p.zone_id
      into v_plant_id, v_zone_id
    from public.plants p
    where p.id = p_plant_id;

    if v_plant_id is null then
      raise exception 'Planta informada nao encontrada: %', p_plant_id;
    end if;

    v_distance_meters := p_assigned_distance_meters;
  else
    select nearest.plant_id, nearest.distance_meters
      into v_plant_id, v_distance_meters
    from public.find_nearest_plant(
      p_latitude,
      p_longitude,
      p_zone_id,
      p_max_distance_meters
    ) nearest;

    if v_plant_id is null then
      raise exception 'Nenhuma planta encontrada proxima ao ponto informado';
    end if;

    select p.zone_id
      into v_zone_id
    from public.plants p
    where p.id = v_plant_id;
  end if;

  select ot.id
    into v_operation_type_id
  from public.operation_types ot
  where ot.code = 'occurrence_annotation';

  if v_operation_type_id is null then
    raise exception 'Tipo de operacao occurrence_annotation nao encontrado';
  end if;

  insert into public.field_operations (
    operation_type_id,
    zone_id,
    source,
    title,
    started_at,
    finished_at,
    notes,
    local_id,
    device_id,
    sync_status,
    synced_at,
    updated_at
  )
  values (
    v_operation_type_id,
    coalesce(p_zone_id, v_zone_id),
    'manual',
    'Anotação de ocorrencia',
    v_observed_at,
    v_observed_at,
    p_notes,
    v_field_operation_local_id,
    p_device_id,
    'synced',
    now(),
    now()
  )
  on conflict (device_id, local_id)
    where device_id is not null and local_id is not null
  do update set
    zone_id = excluded.zone_id,
    notes = excluded.notes,
    sync_status = 'synced',
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at
  returning id into v_field_operation_id;

  insert into public.plant_operation_history (
    plant_id,
    field_operation_id,
    operation_type_id,
    matched_at,
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
    v_plant_id,
    v_field_operation_id,
    v_operation_type_id,
    v_observed_at,
    v_distance_meters,
    'auto_matched',
    'confirmed',
    p_notes,
    p_local_id,
    p_device_id,
    'synced',
    now()
  )
  on conflict on constraint uq_plant_operation do nothing;

  select po.*
    into v_occurrence
  from public.plant_occurrences po
  where po.device_id = p_device_id
    and po.local_id = p_local_id
  order by po.created_at desc
  limit 1;

  if v_occurrence.id is null then
    insert into public.plant_occurrences (
      plant_id,
      occurrence_type_id,
      field_operation_id,
      observed_at,
      severity,
      status,
      notes,
      annotation_latitude,
      annotation_longitude,
      gps_accuracy_m,
      assigned_distance_meters,
      assignment_method,
      assignment_status,
      local_id,
      device_id,
      sync_status,
      synced_at
    )
    values (
      v_plant_id,
      p_occurrence_type_id,
      v_field_operation_id,
      v_observed_at,
      p_severity,
      'open',
      p_notes,
      p_latitude,
      p_longitude,
      p_gps_accuracy_m,
      v_distance_meters,
      v_assignment_method,
      v_assignment_status,
      p_local_id,
      p_device_id,
      'synced',
      now()
    )
    returning * into v_occurrence;
  end if;

  insert into public.plant_occurrence_events (
    occurrence_id,
    plant_id,
    occurrence_type_id,
    field_operation_id,
    action,
    occurred_at,
    previous_value,
    new_value,
    local_change_id,
    device_id
  )
  values (
    v_occurrence.id,
    v_occurrence.plant_id,
    v_occurrence.occurrence_type_id,
    v_field_operation_id,
    'added',
    v_observed_at,
    null,
    jsonb_build_object(
      'status', v_occurrence.status,
      'severity', v_occurrence.severity,
      'notes', v_occurrence.notes,
      'observedAt', v_occurrence.observed_at,
      'latitude', v_occurrence.annotation_latitude,
      'longitude', v_occurrence.annotation_longitude,
      'gpsAccuracyM', v_occurrence.gps_accuracy_m,
      'assignedDistanceMeters', v_occurrence.assigned_distance_meters,
      'assignmentMethod', v_occurrence.assignment_method,
      'assignmentStatus', v_occurrence.assignment_status
    ),
    p_local_id,
    p_device_id
  )
  on conflict (device_id, local_change_id)
    where device_id is not null and local_change_id is not null
  do nothing;

  return query
  select v_field_operation_id, v_occurrence.id, v_plant_id;
end;
$$;
