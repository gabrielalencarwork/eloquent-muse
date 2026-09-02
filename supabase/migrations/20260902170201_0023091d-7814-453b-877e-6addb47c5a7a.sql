CREATE TABLE public.book_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  preference_id TEXT,
  payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  buyer_name TEXT,
  buyer_email TEXT,
  amount NUMERIC(10,2) NOT NULL DEFAULT 33.00,
  download_token TEXT NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  download_count INTEGER NOT NULL DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX book_orders_download_token_idx ON public.book_orders (download_token);
CREATE INDEX book_orders_preference_id_idx ON public.book_orders (preference_id);

GRANT ALL ON public.book_orders TO service_role;

ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;