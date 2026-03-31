import { createClient } from "../lib/supabase";

export default function HomePage() {
  createClient();
  return <main>Next.js plus Supabase fixture</main>;
}
