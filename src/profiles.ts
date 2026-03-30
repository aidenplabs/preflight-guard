import type { ProfileId, ProfileSupportStatus } from "./types.js";

export interface SupportedProfileInfo {
  id: ProfileId;
  label: string;
  supportStatus: ProfileSupportStatus;
}

export const SUPPORTED_PROFILES: SupportedProfileInfo[] = [
  {
    id: "nextjs-supabase-vercel",
    label: "Next.js + Supabase + Vercel",
    supportStatus: "supported"
  },
  {
    id: "nextjs-firebase-vercel",
    label: "Next.js + Firebase + Vercel",
    supportStatus: "experimental"
  }
];

export const PRIMARY_PROFILE = SUPPORTED_PROFILES[0];

export function getProfileInfo(profileId: ProfileId): SupportedProfileInfo {
  const profile = SUPPORTED_PROFILES.find((candidate) => candidate.id === profileId);

  if (!profile) {
    throw new Error(`Unknown profile: ${profileId}`);
  }

  return profile;
}
