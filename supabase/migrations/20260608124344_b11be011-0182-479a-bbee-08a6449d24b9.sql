CREATE OR REPLACE FUNCTION public.slugify(_input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $function$
  SELECT trim(both '-' from regexp_replace(lower(coalesce(_input, '')), '[^a-z0-9]+', '-', 'g'))
$function$;