
CREATE OR REPLACE FUNCTION public.enforce_title_max_words()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF array_length(string_to_array(trim(NEW.title), ' '), 1) > 10 THEN
    NEW.title := array_to_string((string_to_array(trim(NEW.title), ' '))[1:10], ' ');
  END IF;
  RETURN NEW;
END;
$$;
