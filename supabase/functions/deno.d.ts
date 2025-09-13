// Deno type declarations for Edge Functions
declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

declare module "https://deno.land/std@*/http/server.ts" {
  export function serve(handler: (request: Request) => Promise<Response> | Response): void;
}

declare module "https://esm.sh/stripe@*" {
  import Stripe from "stripe";
  export default Stripe;
}

declare module "https://esm.sh/@supabase/supabase-js@*" {
  export * from "@supabase/supabase-js";
}

declare module "https://deno.land/x/xhr@*/mod.ts" {
  // XMLHttpRequest polyfill types
}