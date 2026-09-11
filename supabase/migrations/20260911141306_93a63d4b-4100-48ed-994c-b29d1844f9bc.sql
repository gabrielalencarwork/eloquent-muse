ALTER TABLE public.book_orders
  ADD COLUMN IF NOT EXISTS last_payment_check_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS email_attempt_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_book_download_count(_order_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.book_orders
  SET download_count = download_count + 1
  WHERE id = _order_id
    AND status = 'approved';
$$;

REVOKE ALL ON FUNCTION public.increment_book_download_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_book_download_count(uuid) TO service_role;