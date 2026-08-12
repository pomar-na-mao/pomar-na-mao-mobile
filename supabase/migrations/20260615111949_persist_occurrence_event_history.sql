create table if not exists public.plant_occurrence_events (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null references public.plant_occurrences(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  occurrence_type_id uuid not null references public.occurrence_types(id),
  field_operation_id uuid not null references public.field_operations(id) on delete cascade,
  action text not null,
  occurred_at timestamptz not null,
  previous_value jsonb,
  new_value jsonb,
  local_change_id text,
  device_id text,
  created_at timestamptz not null default now()
);

alter table public.plant_occurrence_events
  add column if not exists occurrence_id uuid,
  add column if not exists plant_id uuid,
  add column if not exists occurrence_type_id uuid,
  add column if not exists field_operation_id uuid,
  add column if not exists action text,
  add column if not exists occurred_at timestamptz,
  add column if not exists previous_value jsonb,
  add column if not exists new_value jsonb,
  add column if not exists local_change_id text,
  add column if not exists device_id text,
  add column if not exists created_at timestamptz default now();

alter table public.plant_occurrence_events
  alter column occurrence_id set not null,
  alter column plant_id set not null,
  alter column occurrence_type_id set not null,
  alter column field_operation_id set not null,
  alter column action set not null,
  alter column occurred_at set not null,
  alter column created_at set default now(),
  alter column created_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.plant_occurrence_events'::regclass
      and contype = 'f'
      and conname = 'plant_occurrence_events_occurrence_id_fkey'
  ) then
    alter table public.plant_occurrence_events
      add constraint plant_occurrence_events_occurrence_id_fkey
      foreign key (occurrence_id) references public.plant_occurrences(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.plant_occurrence_events'::regclass
      and contype = 'f'
      and conname = 'plant_occurrence_events_plant_id_fkey'
  ) then
    alter table public.plant_occurrence_events
      add constraint plant_occurrence_events_plant_id_fkey
      foreign key (plant_id) references public.plants(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.plant_occurrence_events'::regclass
      and contype = 'f'
      and conname = 'plant_occurrence_events_occurrence_type_id_fkey'
  ) then
    alter table public.plant_occurrence_events
      add constraint plant_occurrence_events_occurrence_type_id_fkey
      foreign key (occurrence_type_id) references public.occurrence_types(id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.plant_occurrence_events'::regclass
      and contype = 'f'
      and conname = 'plant_occurrence_events_field_operation_id_fkey'
  ) then
    alter table public.plant_occurrence_events
      add constraint plant_occurrence_events_field_operation_id_fkey
      foreign key (field_operation_id) references public.field_operations(id) on delete cascade;
  end if;
end
$$;

alter table public.plant_occurrence_events
  drop constraint if exists chk_plant_occurrence_events_action;

alter table public.plant_occurrence_events
  add constraint chk_plant_occurrence_events_action
  check (action in ('added', 'updated', 'removed', 'reopened'));

create index if not exists idx_plant_occurrence_events_operation
  on public.plant_occurrence_events (field_operation_id);

create index if not exists idx_plant_occurrence_events_occurrence
  on public.plant_occurrence_events (occurrence_id);

create index if not exists idx_plant_occurrence_events_plant_type_time
  on public.plant_occurrence_events (plant_id, occurrence_type_id, occurred_at, created_at);

create unique index if not exists uq_plant_occurrence_events_device_local
  on public.plant_occurrence_events (device_id, local_change_id)
  where device_id is not null and local_change_id is not null;

create unique index if not exists uq_field_operations_device_local
  on public.field_operations (device_id, local_id)
  where device_id is not null and local_id is not null;

alter table public.plant_occurrence_events enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'plant_occurrence_events'
      and cmd <> 'SELECT'
  loop
    execute format(
      'drop policy if exists %I on public.plant_occurrence_events',
      policy_row.policyname
    );
  end loop;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'plant_occurrence_events'
      and policyname = 'Authenticated users can read plant_occurrence_events'
  ) then
    create policy "Authenticated users can read plant_occurrence_events"
    on public.plant_occurrence_events
    for select
    to authenticated
    using (true);
  end if;
end
$$;

revoke all on public.plant_occurrence_events from public, anon, authenticated;
grant select on public.plant_occurrence_events to authenticated;

drop function if exists public.sync_manual_inspection(jsonb);

create function public.sync_manual_inspection(p_payload jsonb)
returns table (
  field_operation_id uuid,
  created_occurrences_count integer,
  updated_occurrences_count integer,
  resolved_occurrences_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation_type_id uuid;
  v_field_operation_id uuid;
  v_zone_id uuid := nullif(p_payload->>'zoneId', '')::uuid;
  v_target_occurrence_type_id uuid := nullif(p_payload->>'occurrenceTypeId', '')::uuid;
  v_started_at timestamptz := nullif(p_payload->>'startedAt', '')::timestamptz;
  v_finished_at timestamptz := nullif(p_payload->>'finishedAt', '')::timestamptz;
  v_device_id text := nullif(p_payload->>'deviceId', '');
  v_local_inspection_id text := nullif(p_payload->>'localInspectionId', '');
  v_plant jsonb;
  v_change jsonb;
  v_plant_id uuid;
  v_occurrence_type_id uuid;
  v_changed_at timestamptz;
  v_local_change_id text;
  v_existing_occurrence public.plant_occurrences%rowtype;
  v_changed_occurrence public.plant_occurrences%rowtype;
  v_previous_value jsonb;
  v_new_value jsonb;
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_resolved_count integer := 0;
begin
  select ot.id
    into v_operation_type_id
  from public.operation_types ot
  where ot.code = 'manual_inspection';

  if v_operation_type_id is null then
    raise exception 'operation_types.code manual_inspection nao encontrado';
  end if;

  insert into public.field_operations (
    operation_type_id,
    zone_id,
    target_occurrence_type_id,
    source,
    title,
    started_at,
    finished_at,
    device_id,
    local_id,
    sync_status,
    synced_at,
    updated_at
  )
  values (
    v_operation_type_id,
    v_zone_id,
    v_target_occurrence_type_id,
    'inspection',
    'Inspeção manual',
    coalesce(v_started_at, now()),
    v_finished_at,
    v_device_id,
    v_local_inspection_id,
    'synced',
    now(),
    now()
  )
  on conflict (device_id, local_id)
    where device_id is not null and local_id is not null
  do update set
    zone_id = excluded.zone_id,
    target_occurrence_type_id = excluded.target_occurrence_type_id,
    started_at = excluded.started_at,
    finished_at = excluded.finished_at,
    sync_status = 'synced',
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at
  returning id into v_field_operation_id;

  for v_plant in
    select value
    from jsonb_array_elements(coalesce(p_payload->'plantsChanged', '[]'::jsonb))
  loop
    v_plant_id := (v_plant->>'plantId')::uuid;

    insert into public.plant_operation_history (
      plant_id,
      field_operation_id,
      operation_type_id,
      match_source,
      status,
      notes,
      sync_status,
      synced_at
    )
    values (
      v_plant_id,
      v_field_operation_id,
      v_operation_type_id,
      'manual_added',
      'confirmed',
      'Planta alterada durante inspecao manual',
      'synced',
      now()
    )
    on conflict on constraint uq_plant_operation do nothing;

    for v_change in
      select value
      from jsonb_array_elements(coalesce(v_plant->'changes', '[]'::jsonb))
      order by
        nullif(value->>'changedAt', '')::timestamptz nulls last,
        value->>'localChangeId'
    loop
      v_occurrence_type_id := (v_change->>'occurrenceTypeId')::uuid;
      v_changed_at := coalesce(nullif(v_change->>'changedAt', '')::timestamptz, now());
      v_local_change_id := nullif(v_change->>'localChangeId', '');

      if v_device_id is not null
         and v_local_change_id is not null
         and exists (
           select 1
           from public.plant_occurrence_events poe
           where poe.device_id = v_device_id
             and poe.local_change_id = v_local_change_id
         ) then
        continue;
      end if;

      select po.*
        into v_existing_occurrence
      from public.plant_occurrences po
      where po.plant_id = v_plant_id
        and po.occurrence_type_id = v_occurrence_type_id
        and po.status = 'open'
      order by po.observed_at desc, po.created_at desc
      limit 1;

      if v_change->>'changeType' = 'add_occurrence' then
        if v_existing_occurrence.id is null then
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
            v_occurrence_type_id,
            v_field_operation_id,
            v_changed_at,
            nullif(v_change->>'severity', ''),
            'open',
            nullif(v_change->>'notes', ''),
            nullif(v_change->>'latitude', '')::double precision,
            nullif(v_change->>'longitude', '')::double precision,
            nullif(v_change->>'gpsAccuracyM', '')::numeric,
            nullif(v_change->>'distanceToPlantMeters', '')::numeric,
            'manual',
            'confirmed',
            v_local_change_id,
            v_device_id,
            'synced',
            now()
          )
          returning * into v_changed_occurrence;

          v_new_value := coalesce(
            v_change->'newValue',
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at
            )
          );

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'added',
            v_changed_at,
            v_change->'previousValue',
            v_new_value,
            v_local_change_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_created_count := v_created_count + 1;
        else
          v_previous_value := coalesce(
            v_change->'previousValue',
            jsonb_build_object(
              'status', v_existing_occurrence.status,
              'severity', v_existing_occurrence.severity,
              'notes', v_existing_occurrence.notes,
              'observedAt', v_existing_occurrence.observed_at,
              'resolvedAt', v_existing_occurrence.resolved_at
            )
          );

          update public.plant_occurrences po
          set
            severity = coalesce(nullif(v_change->>'severity', ''), po.severity),
            notes = coalesce(nullif(v_change->>'notes', ''), po.notes),
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
          where po.id = v_existing_occurrence.id
          returning * into v_changed_occurrence;

          v_new_value := coalesce(
            v_change->'newValue',
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at,
              'resolvedAt', v_changed_occurrence.resolved_at
            )
          );

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'updated',
            v_changed_at,
            v_previous_value,
            v_new_value,
            v_local_change_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_updated_count := v_updated_count + 1;
        end if;
      elsif v_change->>'changeType' = 'remove_occurrence' then
        if v_existing_occurrence.id is not null then
          v_previous_value := coalesce(
            v_change->'previousValue',
            jsonb_build_object(
              'status', v_existing_occurrence.status,
              'severity', v_existing_occurrence.severity,
              'notes', v_existing_occurrence.notes,
              'observedAt', v_existing_occurrence.observed_at,
              'resolvedAt', v_existing_occurrence.resolved_at
            )
          );

          update public.plant_occurrences po
          set
            status = 'resolved',
            resolved_at = v_changed_at,
            notes = coalesce(nullif(v_change->>'notes', ''), po.notes),
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
          where po.id = v_existing_occurrence.id
          returning * into v_changed_occurrence;

          v_new_value := coalesce(
            v_change->'newValue',
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at,
              'resolvedAt', v_changed_occurrence.resolved_at
            )
          );

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'removed',
            v_changed_at,
            v_previous_value,
            v_new_value,
            v_local_change_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_resolved_count := v_resolved_count + 1;
        end if;
      end if;

      v_existing_occurrence := null;
      v_changed_occurrence := null;
    end loop;
  end loop;

  return query
  select
    v_field_operation_id,
    v_created_count,
    v_updated_count,
    v_resolved_count;
end;
$$;

revoke all on function public.sync_manual_inspection(jsonb) from public;
grant execute on function public.sync_manual_inspection(jsonb)
  to anon, authenticated, service_role;

drop function if exists public.create_occurrence_annotation(
  uuid,
  double precision,
  double precision,
  uuid,
  text,
  text,
  numeric,
  double precision,
  text,
  text,
  uuid,
  numeric,
  text,
  text,
  timestamptz
);

create function public.create_occurrence_annotation(
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
    p_local_id,
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

revoke all on function public.create_occurrence_annotation(
  uuid,
  double precision,
  double precision,
  uuid,
  text,
  text,
  numeric,
  double precision,
  text,
  text,
  uuid,
  numeric,
  text,
  text,
  timestamptz
) from public;

grant execute on function public.create_occurrence_annotation(
  uuid,
  double precision,
  double precision,
  uuid,
  text,
  text,
  numeric,
  double precision,
  text,
  text,
  uuid,
  numeric,
  text,
  text,
  timestamptz
) to anon, authenticated, service_role;

drop function if exists public.sync_polygon_bulk_update(jsonb);

create function public.sync_polygon_bulk_update(p_payload jsonb)
returns table (
  field_operation_id uuid,
  plants_changed_count integer,
  occurrences_created_count integer,
  occurrences_updated_count integer,
  attributes_updated_count integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_operation_type_id uuid;
  v_field_operation_id uuid;
  v_area extensions.geography(polygon, 4326);
  v_device_id text := nullif(p_payload->>'deviceId', '');
  v_local_id text := nullif(p_payload->>'localOperationId', '');
  v_started_at timestamptz := nullif(p_payload->>'startedAt', '')::timestamptz;
  v_finished_at timestamptz := nullif(p_payload->>'finishedAt', '')::timestamptz;
  v_notes text := nullif(p_payload->>'notes', '');
  v_occurrence_action text := lower(coalesce(nullif(p_payload->>'occurrenceAction', ''), 'add'));
  v_new_variety_id bigint := nullif(p_payload->>'varietyId', '')::bigint;
  v_new_planting_date timestamptz := nullif(p_payload->>'plantingDate', '')::timestamptz;
  v_new_life_of_the_tree text := nullif(p_payload->>'lifeOfTree', '');
  v_plant jsonb;
  v_occurrence jsonb;
  v_plant_id uuid;
  v_occurrence_type_id uuid;
  v_existing_occurrence public.plant_occurrences%rowtype;
  v_changed_occurrence public.plant_occurrences%rowtype;
  v_previous_value jsonb;
  v_event_local_id text;
  v_old_variety_id bigint;
  v_old_planting_date timestamptz;
  v_old_life_of_the_tree text;
  v_plants_count integer := 0;
  v_occurrences_created_count integer := 0;
  v_occurrences_updated_count integer := 0;
  v_attributes_count integer := 0;
begin
  if v_occurrence_action not in ('add', 'remove') then
    v_occurrence_action := 'add';
  end if;

  select ot.id
    into v_operation_type_id
  from public.operation_types ot
  where ot.code = 'polygon_bulk_update';

  if v_operation_type_id is null then
    raise exception 'operation_types.code polygon_bulk_update nao encontrado';
  end if;

  v_area := extensions.st_setsrid(
    extensions.st_geomfromgeojson((p_payload->'polygonGeojson')::text),
    4326
  )::extensions.geography;

  insert into public.field_operations (
    operation_type_id,
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
    'manual',
    'Insercao em massa',
    coalesce(v_started_at, now()),
    v_finished_at,
    v_notes,
    v_local_id,
    v_device_id,
    'synced',
    now(),
    now()
  )
  on conflict (device_id, local_id)
    where device_id is not null and local_id is not null
  do update set
    started_at = excluded.started_at,
    finished_at = excluded.finished_at,
    notes = excluded.notes,
    sync_status = 'synced',
    synced_at = excluded.synced_at,
    updated_at = excluded.updated_at
  returning id into v_field_operation_id;

  insert into public.field_operation_areas (
    field_operation_id,
    area,
    area_geojson,
    plants_found_count,
    plants_changed_count,
    local_id,
    device_id,
    sync_status,
    synced_at
  )
  values (
    v_field_operation_id,
    v_area,
    p_payload->'polygonGeojson',
    jsonb_array_length(coalesce(p_payload->'plants', '[]'::jsonb)),
    jsonb_array_length(coalesce(p_payload->'plants', '[]'::jsonb)),
    v_local_id,
    v_device_id,
    'synced',
    now()
  )
  on conflict on constraint uq_field_operation_areas_operation
  do update set
    area = excluded.area,
    area_geojson = excluded.area_geojson,
    plants_found_count = excluded.plants_found_count,
    plants_changed_count = excluded.plants_changed_count,
    sync_status = 'synced',
    synced_at = excluded.synced_at;

  for v_plant in
    select value
    from jsonb_array_elements(coalesce(p_payload->'plants', '[]'::jsonb))
  loop
    v_plant_id := (v_plant->>'plantId')::uuid;
    v_plants_count := v_plants_count + 1;

    insert into public.plant_operation_history (
      plant_id,
      field_operation_id,
      operation_type_id,
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
      'polygon_selected',
      'confirmed',
      'Planta alterada por selecao em massa via poligono',
      v_plant->>'localTargetId',
      v_device_id,
      'synced',
      now()
    )
    on conflict on constraint uq_plant_operation do nothing;

    for v_occurrence in
      select value
      from jsonb_array_elements(coalesce(p_payload->'occurrences', '[]'::jsonb))
    loop
      v_occurrence_type_id := (v_occurrence->>'occurrenceTypeId')::uuid;

      if v_occurrence_action = 'add' then
        v_event_local_id := concat_ws(
          ':',
          'polygon',
          v_local_id,
          v_plant_id::text,
          v_occurrence_type_id::text,
          'add'
        );

        if v_device_id is not null
           and v_local_id is not null
           and exists (
             select 1
             from public.plant_occurrence_events poe
             where poe.device_id = v_device_id
               and poe.local_change_id = v_event_local_id
           ) then
          continue;
        end if;

        select po.*
          into v_existing_occurrence
        from public.plant_occurrences po
        where po.plant_id = v_plant_id
          and po.occurrence_type_id = v_occurrence_type_id
          and po.status = 'open'
        order by po.observed_at desc, po.created_at desc
        limit 1;

        if v_existing_occurrence.id is null then
          insert into public.plant_occurrences (
            plant_id,
            occurrence_type_id,
            field_operation_id,
            observed_at,
            severity,
            status,
            notes,
            assignment_method,
            assignment_status,
            local_id,
            device_id,
            sync_status,
            synced_at
          )
          values (
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            coalesce(v_finished_at, now()),
            nullif(v_occurrence->>'severity', ''),
            'open',
            nullif(v_occurrence->>'notes', ''),
            'polygon_bulk',
            'confirmed',
            nullif(v_occurrence->>'localOccurrenceId', ''),
            v_device_id,
            'synced',
            now()
          )
          returning * into v_changed_occurrence;

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'added',
            coalesce(v_finished_at, now()),
            null,
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at,
              'assignmentMethod', v_changed_occurrence.assignment_method,
              'assignmentStatus', v_changed_occurrence.assignment_status
            ),
            v_event_local_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_occurrences_created_count := v_occurrences_created_count + 1;
        else
          v_previous_value := jsonb_build_object(
            'status', v_existing_occurrence.status,
            'severity', v_existing_occurrence.severity,
            'notes', v_existing_occurrence.notes,
            'observedAt', v_existing_occurrence.observed_at,
            'resolvedAt', v_existing_occurrence.resolved_at
          );

          update public.plant_occurrences po
          set
            severity = coalesce(nullif(v_occurrence->>'severity', ''), po.severity),
            notes = coalesce(nullif(v_occurrence->>'notes', ''), po.notes),
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
          where po.id = v_existing_occurrence.id
          returning * into v_changed_occurrence;

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'updated',
            coalesce(v_finished_at, now()),
            v_previous_value,
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at,
              'resolvedAt', v_changed_occurrence.resolved_at
            ),
            v_event_local_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_occurrences_updated_count := v_occurrences_updated_count + 1;
        end if;
      else
        for v_existing_occurrence in
          select po.*
          from public.plant_occurrences po
          where po.plant_id = v_plant_id
            and po.occurrence_type_id = v_occurrence_type_id
            and po.status = 'open'
          order by po.observed_at, po.created_at
        loop
          v_event_local_id := concat_ws(
            ':',
            'polygon',
            v_local_id,
            v_plant_id::text,
            v_occurrence_type_id::text,
            v_existing_occurrence.id::text,
            'remove'
          );

          if v_device_id is not null
             and v_local_id is not null
             and exists (
               select 1
               from public.plant_occurrence_events poe
               where poe.device_id = v_device_id
                 and poe.local_change_id = v_event_local_id
             ) then
            continue;
          end if;

          v_previous_value := jsonb_build_object(
            'status', v_existing_occurrence.status,
            'severity', v_existing_occurrence.severity,
            'notes', v_existing_occurrence.notes,
            'observedAt', v_existing_occurrence.observed_at,
            'resolvedAt', v_existing_occurrence.resolved_at
          );

          update public.plant_occurrences po
          set
            status = 'resolved',
            resolved_at = coalesce(v_finished_at, now()),
            notes = coalesce(nullif(v_occurrence->>'notes', ''), po.notes),
            updated_at = now(),
            sync_status = 'synced',
            synced_at = now()
          where po.id = v_existing_occurrence.id
          returning * into v_changed_occurrence;

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
            v_changed_occurrence.id,
            v_plant_id,
            v_occurrence_type_id,
            v_field_operation_id,
            'removed',
            coalesce(v_finished_at, now()),
            v_previous_value,
            jsonb_build_object(
              'status', v_changed_occurrence.status,
              'severity', v_changed_occurrence.severity,
              'notes', v_changed_occurrence.notes,
              'observedAt', v_changed_occurrence.observed_at,
              'resolvedAt', v_changed_occurrence.resolved_at
            ),
            v_event_local_id,
            v_device_id
          )
          on conflict (device_id, local_change_id)
            where device_id is not null and local_change_id is not null
          do nothing;

          v_occurrences_updated_count := v_occurrences_updated_count + 1;
        end loop;
      end if;

      v_existing_occurrence := null;
      v_changed_occurrence := null;
    end loop;

    select p.variety_id, p.planting_date, p.life_of_the_tree
      into v_old_variety_id, v_old_planting_date, v_old_life_of_the_tree
    from public.plants p
    where p.id = v_plant_id;

    if v_new_variety_id is not null
       and v_old_variety_id is distinct from v_new_variety_id then
      update public.plants
      set
        variety_id = v_new_variety_id,
        updated_at = now(),
        sync_status = 'synced',
        synced_at = now()
      where id = v_plant_id;

      insert into public.plant_attribute_change_history (
        plant_id,
        field_operation_id,
        attribute_name,
        old_value,
        new_value,
        changed_at,
        notes,
        local_id,
        device_id,
        sync_status,
        synced_at
      )
      values (
        v_plant_id,
        v_field_operation_id,
        'variety_id',
        v_old_variety_id::text,
        v_new_variety_id::text,
        coalesce(v_finished_at, now()),
        v_notes,
        concat_ws(':', v_local_id, v_plant_id::text, 'variety_id'),
        v_device_id,
        'synced',
        now()
      );

      v_attributes_count := v_attributes_count + 1;
    end if;

    if v_new_life_of_the_tree is not null
       and v_old_life_of_the_tree is distinct from v_new_life_of_the_tree then
      update public.plants
      set
        life_of_the_tree = v_new_life_of_the_tree,
        updated_at = now(),
        sync_status = 'synced',
        synced_at = now()
      where id = v_plant_id;

      insert into public.plant_attribute_change_history (
        plant_id,
        field_operation_id,
        attribute_name,
        old_value,
        new_value,
        changed_at,
        notes,
        local_id,
        device_id,
        sync_status,
        synced_at
      )
      values (
        v_plant_id,
        v_field_operation_id,
        'life_of_the_tree',
        v_old_life_of_the_tree,
        v_new_life_of_the_tree,
        coalesce(v_finished_at, now()),
        v_notes,
        concat_ws(':', v_local_id, v_plant_id::text, 'life_of_the_tree'),
        v_device_id,
        'synced',
        now()
      );

      v_attributes_count := v_attributes_count + 1;
    end if;

    if v_new_planting_date is not null
       and v_old_planting_date is distinct from v_new_planting_date then
      update public.plants
      set
        planting_date = v_new_planting_date,
        updated_at = now(),
        sync_status = 'synced',
        synced_at = now()
      where id = v_plant_id;

      insert into public.plant_attribute_change_history (
        plant_id,
        field_operation_id,
        attribute_name,
        old_value,
        new_value,
        changed_at,
        notes,
        local_id,
        device_id,
        sync_status,
        synced_at
      )
      values (
        v_plant_id,
        v_field_operation_id,
        'planting_date',
        v_old_planting_date::text,
        v_new_planting_date::text,
        coalesce(v_finished_at, now()),
        v_notes,
        concat_ws(':', v_local_id, v_plant_id::text, 'planting_date'),
        v_device_id,
        'synced',
        now()
      );

      v_attributes_count := v_attributes_count + 1;
    end if;
  end loop;

  return query
  select
    v_field_operation_id,
    v_plants_count,
    v_occurrences_created_count,
    v_occurrences_updated_count,
    v_attributes_count;
end;
$$;

revoke all on function public.sync_polygon_bulk_update(jsonb) from public, anon;
grant execute on function public.sync_polygon_bulk_update(jsonb) to authenticated;

drop function if exists public.get_inspection_operations(date, date, uuid);

create function public.get_inspection_operations(
  p_start_date date default null,
  p_end_date date default null,
  p_zone_id uuid default null
)
returns table (
  operation_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  zone_name text,
  plants jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    fo.id as operation_id,
    fo.started_at,
    fo.finished_at,
    fo.notes,
    z.name as zone_name,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'plant_id', p.id,
            'latitude', p.latitude,
            'longitude', p.longitude,
            'occurrences', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'occurrence_id', po.id,
                    'occurrence_type_id', po.occurrence_type_id,
                    'occurrence_type_name', ot.name,
                    'status', po.status,
                    'severity', po.severity,
                    'notes', po.notes,
                    'observed_at', po.observed_at,
                    'resolved_at', po.resolved_at
                  )
                  order by po.observed_at, po.created_at
                )
                from public.plant_occurrences po
                join public.occurrence_types ot
                  on ot.id = po.occurrence_type_id
                where po.plant_id = p.id
                  and po.field_operation_id = fo.id
              ),
              '[]'::jsonb
            ),
            'occurrence_events', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'event_id', poe.id,
                    'occurrence_id', poe.occurrence_id,
                    'occurrence_type_id', poe.occurrence_type_id,
                    'occurrence_type_name', event_type.name,
                    'action', poe.action,
                    'occurred_at', poe.occurred_at,
                    'previous_value', poe.previous_value,
                    'new_value', poe.new_value,
                    'current_status', current_occurrence.status
                  )
                  order by poe.occurred_at, poe.created_at, poe.id
                )
                from public.plant_occurrence_events poe
                join public.occurrence_types event_type
                  on event_type.id = poe.occurrence_type_id
                left join public.plant_occurrences current_occurrence
                  on current_occurrence.id = poe.occurrence_id
                where poe.plant_id = p.id
                  and poe.field_operation_id = fo.id
              ),
              '[]'::jsonb
            )
          )
          order by p.id
        )
        from public.plant_operation_history poh
        join public.plants p
          on p.id = poh.plant_id
        where poh.field_operation_id = fo.id
      ),
      '[]'::jsonb
    ) as plants
  from public.field_operations fo
  left join public.zones z
    on z.id = fo.zone_id
  where fo.source = 'inspection'
    and (p_start_date is null or fo.created_at::date >= p_start_date)
    and (p_end_date is null or fo.created_at::date <= p_end_date)
    and (p_zone_id is null or fo.zone_id = p_zone_id);
$$;

revoke all on function public.get_inspection_operations(date, date, uuid)
  from public, anon;
grant execute on function public.get_inspection_operations(date, date, uuid)
  to authenticated;
