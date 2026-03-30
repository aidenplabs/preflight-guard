import type { RulePackDefinition } from "../types.js";
import type { ProfileId } from "../types.js";
import { PRIMARY_PROFILE } from "../profiles.js";
import { nextJsSupabaseVercelRules } from "./nextjs-supabase-vercel.js";

const registeredRulePacks: RulePackDefinition[] = [
  {
    id: "nextjs-supabase-vercel-v1",
    profile: PRIMARY_PROFILE.id,
    rules: nextJsSupabaseVercelRules
  }
];

export function getRulePackForProfile(profile: ProfileId): RulePackDefinition {
  const rulePack = registeredRulePacks.find((candidate) => candidate.profile === profile);

  if (!rulePack) {
    throw new Error(`No rule pack registered for profile: ${profile}`);
  }

  return rulePack;
}

export function listRegisteredRulePacks(): RulePackDefinition[] {
  return [...registeredRulePacks];
}
