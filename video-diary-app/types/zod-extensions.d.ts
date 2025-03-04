import { z } from "zod";

// Add infer and ZodType to zod
declare module "zod" {
  export type ZodType<T = any, Def = any, I = T> = z.ZodSchema<T, Def, I>;
  export type infer<T extends z.ZodSchema<any, any>> = z.infer<T>;
}
