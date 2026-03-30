export type Severity = "Blocker" | "High" | "Medium";

export type Confidence = "confirmed" | "likely" | "review-needed";

export type Category = "stack-detection" | "supabase-auth" | "firebase-auth-config" | "env-secrets-config";

export type ProfileId = "nextjs-supabase-vercel" | "nextjs-firebase-vercel";

export type ProfileSupportStatus = "supported" | "experimental";

export type ComponentConfidence = "high" | "medium" | "low";

export type ProfileFit = "strong-match" | "partial-match" | "weak-match";

export interface ProjectFile {
  path: string;
  absolutePath: string;
  content: string;
}

export interface StackSignal {
  signal: string;
  evidence: string;
}

export interface StackComponent {
  name: "Next.js" | "Supabase" | "Firebase" | "Vercel";
  detected: boolean;
  confidence: ComponentConfidence;
  score: number;
  maxScore: number;
  signals: StackSignal[];
}

export interface StackDetectionResult {
  profile: ProfileId;
  supportStatus: ProfileSupportStatus;
  overallConfidence: ComponentConfidence;
  profileFit: ProfileFit;
  components: StackComponent[];
  summary: string;
}

export interface ProjectSignals {
  envFiles: string[];
  middlewareFiles: string[];
  nextRouteFiles: string[];
  apiRouteFiles: string[];
  serverActionFiles: string[];
  clientFiles: string[];
  supabaseFiles: string[];
  firebaseFiles: string[];
  vercelFiles: string[];
}

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  category: Category;
  filePath: string;
  explanation: string;
  whyItMatters: string;
  minimumFix: string;
  evidence?: string[];
}

export interface RuleContext {
  rootPath: string;
  files: ProjectFile[];
  stack: StackDetectionResult;
  signals: ProjectSignals;
}

export interface Rule {
  id: string;
  title: string;
  category: Exclude<Category, "stack-detection">;
  run: (context: RuleContext) => Finding[];
}

export interface RulePackDefinition {
  id: string;
  profile: StackDetectionResult["profile"];
  rules: Rule[];
}

export interface ProjectSummary {
  scannedPath: string;
  scannedAt: string;
  fileCount: number;
}

export interface ScanResult {
  schemaVersion: "1";
  summary: ProjectSummary;
  stack: StackDetectionResult;
  findings: Finding[];
  shipRecommendation: "yes" | "caution" | "no";
  limitations: string[];
  exitCode: number;
}
