
CREATE OR REPLACE FUNCTION public.enforce_title_max_words()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Truncate title to 10 words max
  IF array_length(string_to_array(trim(NEW.title), ' '), 1) > 10 THEN
    NEW.title := array_to_string((string_to_array(trim(NEW.title), ' '))[1:10], ' ');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_title_max_words
  BEFORE INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_title_max_words();
