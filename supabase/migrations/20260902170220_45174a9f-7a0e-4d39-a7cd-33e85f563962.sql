CREATE POLICY "Pedidos não são acessíveis publicamente"
ON public.book_orders FOR SELECT TO authenticated, anon USING (false);