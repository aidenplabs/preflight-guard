import { createClient } from "../lib/supabase";
import { deploymentUrl } from "../lib/vercel";

export default function HomePage() {
  createClient();
  return <main>{deploymentUrl || "Next.js plus Supabase plus Vercel fixture"}</main>;
}
