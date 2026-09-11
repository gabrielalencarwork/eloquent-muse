import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
const StatusSchema = z.object({
  token: z.string().trim().min(10).max(80),
  paymentId: z.string().trim().max(80).optional(),
  origin: z.string().trim().url(),
});

export const getOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => StatusSchema.parse(input))
  .handler(async ({ data }) => {
    const [{ supabaseAdmin }, { reconcileBookOrder }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("@/lib/livro.server"),
    ]);
    const order = await reconcileBookOrder(
      supabaseAdmin,
      data.token,
      data.origin.replace(/\/+$/, ""),
      data.paymentId,
    );

    if (!order) return { found: false, paid: false, nome: null as string | null };

    return {
      found: true,
      paid: order.status === "approved",
      nome: order.buyer_name as string | null,
    };
  });
