do $migration$
declare
  v_function_definition text;
  v_corrected_definition text;
begin
  select pg_get_functiondef(
    'public.sync_reviewed_spraying_operation(jsonb)'::regprocedure
  )
  into v_function_definition;

  if v_function_definition is null then
    raise exception 'sync_reviewed_spraying_operation(jsonb) nao encontrada';
  end if;

  if position('#variable_conflict use_column' in v_function_definition) > 0 then
    return;
  end if;

  v_corrected_definition := replace(
    v_function_definition,
    E'AS $function$\n',
    E'AS $function$\n#variable_conflict use_column\n'
  );

  if v_corrected_definition = v_function_definition then
    raise exception 'Nao foi possivel inserir a diretiva variable_conflict';
  end if;

  execute v_corrected_definition;
end;
$migration$;
