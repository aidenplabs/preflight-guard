import { createClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  const user = await supabase.auth.getUser();
  if (!user.data.user) {
    return new Response("forbidden", { status: 403 });
  }

  await supabase.from("users").delete();
  return Response.json({ ok: true });
}
