
CREATE TABLE public.caderno_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  texto text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.caderno_messages TO anon, authenticated;
GRANT ALL ON public.caderno_messages TO service_role;

ALTER TABLE public.caderno_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert messages"
ON public.caderno_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(nome)) BETWEEN 1 AND 80
  AND length(trim(texto)) BETWEEN 1 AND 2000
);
