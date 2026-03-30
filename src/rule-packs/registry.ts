import type { RulePackDefinition } from "../types.js";
import { nextJsSupabaseVercelRules } from "./nextjs-supabase-vercel.js";

const registeredRulePacks: RulePackDefinition[] = [
  {
    id: "nextjs-supabase-vercel-v1",
    profile: "nextjs-supabase-vercel",
    rules: nextJsSupabaseVercelRules
  }
];

export function getActiveRulePack(): RulePackDefinition {
  return registeredRulePacks[0];
}

export function listRegisteredRulePacks(): RulePackDefinition[] {
  return [...registeredRulePacks];
}
