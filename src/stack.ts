import type {
  ComponentConfidence,
  ProfileFit,
  ProjectFile,
  ProjectSignals,
  StackComponent,
  StackDetectionResult,
  StackSignal
} from "./types.js";

function findFile(files: ProjectFile[], matcher: (file: ProjectFile) => boolean): ProjectFile | undefined {
  return files.find(matcher);
}

function isCodeOrConfigFile(file: ProjectFile): boolean {
  return !file.path.endsWith(".md") && !file.path.endsWith(".txt");
}

function isLikelyAppFile(file: ProjectFile): boolean {
  return /(^|\/)(app|pages|src|lib|utils|supabase)\//.test(file.path) || file.path === "package.json" || file.path.startsWith(".env");
}

function getPackageJson(files: ProjectFile[]): Record<string, unknown> | null {
  const packageFile = findFile(files, (file) => file.path === "package.json");
  if (!packageFile) {
    return null;
  }

  try {
    return JSON.parse(packageFile.content) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function getDependencyMap(packageJson: Record<string, unknown> | null): Record<string, string> {
  if (!packageJson) {
    return {};
  }

  const dependencies = typeof packageJson.dependencies === "object" && packageJson.dependencies ? packageJson.dependencies : {};
  const devDependencies = typeof packageJson.devDependencies === "object" && packageJson.devDependencies ? packageJson.devDependencies : {};

  return {
    ...(dependencies as Record<string, string>),
    ...(devDependencies as Record<string, string>)
  };
}

function confidenceFromScore(score: number): ComponentConfidence {
  if (score >= 5) {
    return "high";
  }

  if (score >= 3) {
    return "medium";
  }

  return "low";
}

function buildComponent(name: StackComponent["name"], signals: StackSignal[], score: number, maxScore: number): StackComponent {
  return {
    name,
    detected: score >= 3,
    confidence: confidenceFromScore(score),
    score,
    maxScore,
    signals
  };
}

function detectNext(files: ProjectFile[], dependencies: Record<string, string>, projectSignals: ProjectSignals): StackComponent {
  const signals: StackSignal[] = [];
  let score = 0;

  if (dependencies.next) {
    signals.push({ signal: "dependency", evidence: `package.json includes next@${dependencies.next}` });
    score += 3;
  }

  if (findFile(files, (file) => /^next\.config\.(js|mjs|ts|cjs)$/.test(file.path))) {
    signals.push({ signal: "config", evidence: "next.config file found" });
    score += 2;
  }

  if (projectSignals.nextRouteFiles.length > 0) {
    signals.push({ signal: "routing", evidence: `Next.js route files found (${projectSignals.nextRouteFiles.length})` });
    score += 2;
  }

  if (projectSignals.middlewareFiles.length > 0) {
    signals.push({ signal: "middleware", evidence: `middleware present (${projectSignals.middlewareFiles.join(", ")})` });
    score += 1;
  }

  return buildComponent("Next.js", signals, score, 8);
}

function detectSupabase(files: ProjectFile[], dependencies: Record<string, string>, projectSignals: ProjectSignals): StackComponent {
  const signals: StackSignal[] = [];
  let score = 0;

  if (dependencies["@supabase/supabase-js"] || dependencies.supabase) {
    const version = dependencies["@supabase/supabase-js"] ?? dependencies.supabase;
    signals.push({ signal: "dependency", evidence: `package.json includes Supabase dependency (${version})` });
    score += 3;
  }

  if (projectSignals.supabaseFiles.some((filePath) => filePath.startsWith("supabase/"))) {
    signals.push({ signal: "folder", evidence: "supabase/ directory found" });
    score += 2;
  }

  if (findFile(files, (file) => isCodeOrConfigFile(file) && isLikelyAppFile(file) && /@supabase\/supabase-js|SUPABASE_URL|NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE_ROLE_KEY|createClient\(|createBrowserClient\(|createServerClient\(/.test(file.content))) {
    signals.push({ signal: "code", evidence: "Supabase env names or client creation found in code" });
    score += 3;
  }

  if (projectSignals.envFiles.some((filePath) => files.find((file) => file.path === filePath && /SUPABASE_URL|NEXT_PUBLIC_SUPABASE|SUPABASE_SERVICE_ROLE_KEY/.test(file.content)))) {
    signals.push({ signal: "env", evidence: "Supabase-related env variables found" });
    score += 1;
  }

  return buildComponent("Supabase", signals, score, 9);
}

function detectVercel(files: ProjectFile[], dependencies: Record<string, string>, projectSignals: ProjectSignals): StackComponent {
  const signals: StackSignal[] = [];
  let score = 0;

  if (dependencies.vercel) {
    signals.push({ signal: "dependency", evidence: `package.json includes vercel@${dependencies.vercel}` });
    score += 2;
  }

  if (findFile(files, (file) => file.path === "vercel.json")) {
    signals.push({ signal: "config", evidence: "vercel.json found" });
    score += 2;
  }

  if (findFile(files, (file) => isCodeOrConfigFile(file) && isLikelyAppFile(file) && /process\.env\.VERCEL|VERCEL_URL|@vercel\//.test(file.content))) {
    signals.push({ signal: "code", evidence: "Vercel env names or package references found" });
    score += 1;
  }

  if (projectSignals.vercelFiles.length > 0) {
    score += 1;
  }

  return buildComponent("Vercel", signals, score, 6);
}

function getProfileFit(components: StackComponent[]): ProfileFit {
  const next = components.find((component) => component.name === "Next.js");
  const supabase = components.find((component) => component.name === "Supabase");
  const vercel = components.find((component) => component.name === "Vercel");
  const detectedCount = components.filter((component) => component.detected).length;

  if (next?.detected && supabase?.detected && (vercel?.detected || vercel?.confidence === "medium")) {
    return "strong-match";
  }

  if (detectedCount >= 2) {
    return "partial-match";
  }

  return "weak-match";
}

function getOverallConfidence(components: StackComponent[], profileFit: ProfileFit): ComponentConfidence {
  const highCount = components.filter((component) => component.confidence === "high").length;
  const mediumOrHigherCount = components.filter((component) => component.confidence !== "low").length;

  if (profileFit === "strong-match" && highCount >= 1 && mediumOrHigherCount >= 2) {
    return "high";
  }

  if (profileFit !== "weak-match") {
    return "medium";
  }

  return "low";
}

export function detectStack(files: ProjectFile[], projectSignals: ProjectSignals): StackDetectionResult {
  const packageJson = getPackageJson(files);
  const dependencies = getDependencyMap(packageJson);

  const components = [
    detectNext(files, dependencies, projectSignals),
    detectSupabase(files, dependencies, projectSignals),
    detectVercel(files, dependencies, projectSignals)
  ];

  const profileFit = getProfileFit(components);
  const overallConfidence = getOverallConfidence(components, profileFit);
  const detectedNames = components.filter((component) => component.detected).map((component) => component.name);

  const summary = profileFit === "strong-match"
    ? `Detected a strong Next.js + Supabase + Vercel profile match with ${overallConfidence} confidence.`
    : detectedNames.length > 0
      ? `Detected a ${profileFit} for the target stack based on ${detectedNames.join(", ")} signals.`
      : "Could not confidently detect the target stack from the current repo.";

  return {
    profile: "nextjs-supabase-vercel",
    overallConfidence,
    profileFit,
    components,
    summary
  };
}
