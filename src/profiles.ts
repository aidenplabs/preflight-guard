import type { ProfileId } from "./types.js";

export interface SupportedProfileInfo {
  id: ProfileId;
  label: string;
  supportStatus: "supported";
}

export const SUPPORTED_PROFILES: SupportedProfileInfo[] = [
  {
    id: "nextjs-supabase-vercel",
    label: "Next.js + Supabase + Vercel",
    supportStatus: "supported"
  }
];

export const PRIMARY_PROFILE = SUPPORTED_PROFILES[0];
