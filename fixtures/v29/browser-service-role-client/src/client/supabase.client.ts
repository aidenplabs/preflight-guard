"use client";

import { createClient } from "@supabase/supabase-js";

const browserRole = "service_role";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  browserRole
);
