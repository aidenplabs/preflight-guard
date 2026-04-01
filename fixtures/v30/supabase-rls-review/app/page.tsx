import { createClient } from "@supabase/supabase-js";

export default function Page() {
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  return <main>supabase rls review fixture</main>;
}
