import { appendFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const repoRoot = process.cwd();
const localOutputRoot = resolve(repoRoot, ".preflight-curated");
const cloneRoot = "/tmp/preflight-curated-validation";
const historyPath = join(localOutputRoot, "history.jsonl");
const latestPath = join(localOutputRoot, "latest.json");
const lastRunPath = join(localOutputRoot, "last-run.json");

const targets = [
  {
    id: "public-nextjs-vercel-clean",
    sourceType: "public-anchor",
    kind: "github",
    repo: "vercel/example-marketplace-integration",
    rationale: "Current clean public anchor for Next.js + Vercel."
  },
  {
    id: "public-nextjs-vercel-breadth",
    sourceType: "public-anchor",
    kind: "github",
    repo: "vercel/platforms",
    rationale: "Current second clean public anchor for Next.js + Vercel breadth."
  },
  {
    id: "public-nextjs-supabase-vercel-clean",
    sourceType: "public-anchor",
    kind: "github",
    repo: "KolbySisk/next-supabase-stripe-starter",
    rationale: "Current clean public anchor for Next.js + Supabase + Vercel."
  },
  {
    id: "public-nextjs-supabase-review",
    sourceType: "public-anchor",
    kind: "github",
    repo: "Halo-Lab/next-supabase-todo",
    rationale: "Current review-needed public anchor for Next.js + Supabase."
  },
  {
    id: "local-nextjs-vercel-clean",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v18/nextjs-vercel-clean",
    rationale: "Local clean control for Next.js + Vercel."
  },
  {
    id: "local-nextjs-supabase-clean",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v18/nextjs-supabase-clean",
    rationale: "Local clean control for Next.js + Supabase."
  },
  {
    id: "local-nextjs-supabase-vercel-clean",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v18/nextjs-supabase-vercel-clean",
    rationale: "Local clean control for Next.js + Supabase + Vercel."
  },
  {
    id: "local-sb003-elevated-review",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v3/missing-route-auth",
    rationale: "Local elevated-review control for SB003."
  },
  {
    id: "local-env002-blocker",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v3/unsafe-public-service-role",
    rationale: "Local confirmed-blocker control for ENV002."
  },
  {
    id: "local-sb001-blocker",
    sourceType: "local-control",
    kind: "local",
    path: "fixtures/v29/browser-service-role-client",
    rationale: "Local likely-blocker control for SB001."
  },
  {
    id: "deeper-nextjs-supabase-elevated-review",
    sourceType: "public-anchor",
    kind: "github",
    repo: "imbhargav5/nextbase-nextjs-supabase-starter",
    rationale: "Current elevated-review public anchor for Next.js + Supabase."
  },
  {
    id: "deeper-nextjs-supabase-business-app",
    sourceType: "public-anchor",
    kind: "github",
    repo: "vercel/nextjs-subscription-payments",
    rationale: "Current clean business-shaped public anchor for Next.js + Supabase."
  },
  {
    id: "deeper-nextjs-review-only-boundary",
    sourceType: "public-anchor",
    kind: "github",
    repo: "vercel/nextjs-portfolio-starter",
    rationale: "Current review-only boundary public anchor for Vercel-like Next.js repos."
  },
  {
    id: "deeper-nextjs-supabase-vercel-complex",
    sourceType: "public-anchor",
    kind: "github",
    repo: "supabase-community/vercel-ai-chatbot",
    rationale: "Current elevated-review public anchor for Next.js + Supabase + Vercel."
  }
];

const SOURCE_GROUPS = {
  "public-anchors": ["public-anchor"],
  "local-controls": ["local-control"],
  "deeper-local-only": ["deeper-local-only"],
  "all": ["public-anchor", "local-control", "deeper-local-only"]
};

function parseArgs(argv) {
  const options = {
    group: "local-controls",
    only: null,
    failOn: "never"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--group") {
      options.group = argv[index + 1];
      index += 1;
    } else if (arg === "--only") {
      options.only = argv[index + 1];
      index += 1;
    } else if (arg === "--fail-on") {
      options.failOn = argv[index + 1];
      index += 1;
    }
  }

  return options;
}

function listAvailableGroups() {
  return Object.keys(SOURCE_GROUPS);
}

function selectTargets(group, only) {
  const sourceTypes = SOURCE_GROUPS[group];
  if (!sourceTypes) {
    throw new Error(`Unknown group "${group}". Expected one of: ${listAvailableGroups().join(", ")}`);
  }

  const selected = targets.filter((target) => sourceTypes.includes(target.sourceType));
  if (!selected.length) {
    throw new Error(`No targets found for group "${group}".`);
  }

  if (!only) {
    return selected;
  }

  const filtered = selected.filter((target) => target.id === only || target.repo === only || target.path === only);
  if (!filtered.length) {
    throw new Error(`No target matched "${only}" inside group "${group}".`);
  }

  return filtered;
}

async function loadJson(filePath, fallbackValue) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return fallbackValue;
    }

    throw error;
  }
}

function unique(values) {
  return Array.from(new Set(values));
}

function summarizeEvidence(records) {
  const publicSupported = records.filter((record) => record.sourceType === "public-anchor" && record.supportStatus === "supported");
  const publicCleanSupported = publicSupported.filter((record) => record.shipRecommendation === "yes");
  const publicReviewSupported = publicSupported.filter((record) => record.shipRecommendation === "caution");
  const publicElevatedReview = publicSupported.filter((record) => record.recommendationBasis === "elevated-review-findings");
  const reviewOnlyBoundary = records.filter((record) => record.supportStatus === "review-only");
  const blockerCases = records.filter((record) => record.shipRecommendation === "no");

  return {
    strongestCurrentEvidence: [
      ...publicCleanSupported.map((record) => ({
        targetId: record.targetId,
        reason: `clean supported ${record.detectedCombination} anchor`
      })),
      ...publicReviewSupported
        .filter((record) => record.recommendationBasis === "review-findings")
        .map((record) => ({
          targetId: record.targetId,
          reason: `supported review-needed ${record.detectedCombination} anchor`
        }))
    ],
    weakestCurrentEvidence: [
      ...(publicElevatedReview.length === 0 ? [{ area: "public-proof", note: "no public supported-elevated-review anchor yet" }] : []),
      ...(reviewOnlyBoundary.length > 0 ? [{ area: "vercel-boundary", note: "review-only boundary still depends on a small public sample" }] : []),
      ...(blockerCases.length > 0 ? [{ area: "blocker-proof", note: "blocker behavior is still mostly fixture-backed rather than public-proof-backed" }] : [])
    ],
    candidateProductImprovements: {
      "scanner/recommendation logic": publicElevatedReview.length === 0
        ? ["Keep monitoring strong-match Supabase caution cases; do not tune scoring until public elevated-review evidence is broader."]
        : ["No scanner/recommendation change is justified from the current curated set alone."],
      "beginner-facing explanation wording": reviewOnlyBoundary.length > 0
        ? ["Keep explaining that clean review-only Next.js repos are orientation signals, not support-grade clean scans."]
        : ["No wording change is justified from the current curated set alone."],
      "AI handoff prompt quality": blockerCases.length > 0
        ? ["Validate real assistant behavior on SB001 and ENV002 before adding broader prompt coverage."]
        : ["No prompt change is justified from the current curated set alone."],
      "benchmark/public proof": [
        ...(publicElevatedReview.length === 0 ? ["Highest-value missing proof: one public supported-elevated-review anchor."] : []),
        ...(publicCleanSupported.filter((record) => record.detectedCombination === "Next.js + Vercel").length < 2
          ? ["Still thin on public clean Next.js + Vercel breadth; one more trusted Vercel-facing anchor would help."]
          : [])
      ]
    }
  };
}

function compareAgainstPrevious(previousRecord, nextRecord) {
  if (!previousRecord) {
    return {
      materiallyChanged: true,
      changedFields: ["new-target"]
    };
  }

  const changedFields = [];
  const comparableFields = [
    "detectedCombination",
    "supportStatus",
    "overallConfidence",
    "profileFit",
    "shipRecommendation",
    "recommendationBasis",
    "aiHandoffPromptCount"
  ];

  for (const field of comparableFields) {
    if (previousRecord[field] !== nextRecord[field]) {
      changedFields.push(field);
    }
  }

  if (previousRecord.findingIds.join("|") !== nextRecord.findingIds.join("|")) {
    changedFields.push("findingIds");
  }

  return {
    materiallyChanged: changedFields.length > 0,
    changedFields
  };
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "pipe",
    ...options
  });

  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n");
    throw new Error(detail || `${command} ${args.join(" ")} failed`);
  }

  return result;
}

async function resolveTargetPath(target) {
  if (target.kind === "local") {
    return resolve(repoRoot, target.path);
  }

  const slug = target.repo.replace("/", "-");
  const targetDir = join(cloneRoot, slug);

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(cloneRoot, { recursive: true });
  runCommand("git", ["clone", "--depth", "1", `https://github.com/${target.repo}.git`, targetDir]);
  return targetDir;
}

async function runTarget(target, failOn) {
  const targetPath = await resolveTargetPath(target);
  const outputDir = join(localOutputRoot, target.id);

  await rm(outputDir, { recursive: true, force: true });

  runCommand("npm", ["run", "dev", "--", "scan", targetPath, "--output", outputDir, "--fail-on", failOn]);

  const report = JSON.parse(await readFile(join(outputDir, "preflight-report.json"), "utf8"));

  return {
    targetId: target.id,
    sourceType: target.sourceType,
    targetKind: target.kind,
    reference: target.kind === "github" ? target.repo : target.path,
    rationale: target.rationale,
    outputDir,
    detectedCombination: report.stack.combinationLabel,
    combinationId: report.stack.combination,
    supportStatus: report.stack.supportStatus,
    overallConfidence: report.stack.overallConfidence,
    profileFit: report.stack.profileFit,
    shipRecommendation: report.shipRecommendation,
    recommendationBasis: report.recommendationBasis,
    findingIds: unique(report.findings.map((finding) => finding.ruleId)),
    aiHandoffPromptCount: report.aiHandoffs.length,
    findings: report.findings.map((finding) => ({
      ruleId: finding.ruleId,
      severity: finding.severity,
      filePath: finding.filePath
    }))
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selectedTargets = selectTargets(options.group, options.only);
  const runId = new Date().toISOString().replace(/[:.]/g, "-");

  await mkdir(localOutputRoot, { recursive: true });

  const previousLatest = await loadJson(latestPath, { targets: {} });
  const results = [];

  for (const target of selectedTargets) {
    process.stdout.write(`Running curated validation for ${target.id}...\n`);
    const record = await runTarget(target, options.failOn);
    const comparison = compareAgainstPrevious(previousLatest.targets[record.targetId], record);

    results.push({
      ...record,
      materiallyChanged: comparison.materiallyChanged,
      changedFields: comparison.changedFields
    });
  }

  const latestTargets = {
    ...previousLatest.targets
  };

  for (const result of results) {
    latestTargets[result.targetId] = {
      ...result,
      runId,
      generatedAt: new Date().toISOString()
    };
  }

  const groupedCounts = {
    totalTargets: Object.keys(latestTargets).length,
    bySourceType: {
      "public-anchor": Object.values(latestTargets).filter((record) => record.sourceType === "public-anchor").length,
      "local-control": Object.values(latestTargets).filter((record) => record.sourceType === "local-control").length,
      "deeper-local-only": Object.values(latestTargets).filter((record) => record.sourceType === "deeper-local-only").length
    }
  };

  const evidenceSummary = summarizeEvidence(Object.values(latestTargets));
  const lastRun = {
    runId,
    generatedAt: new Date().toISOString(),
    group: options.group,
    failOn: options.failOn,
    targetIds: results.map((result) => result.targetId),
    changedTargets: results.filter((result) => result.materiallyChanged).map((result) => result.targetId),
    stableTargets: results.filter((result) => !result.materiallyChanged).map((result) => result.targetId),
    targets: results,
    groupedCounts,
    evidenceSummary
  };

  const historyLines = results.map((result) => JSON.stringify({
    runId,
    generatedAt: lastRun.generatedAt,
    group: options.group,
    failOn: options.failOn,
    ...result
  })).join("\n");

  if (historyLines.length > 0) {
    await appendFile(historyPath, `${historyLines}\n`, "utf8");
  }

  await writeFile(latestPath, JSON.stringify({
    updatedAt: lastRun.generatedAt,
    groupedCounts,
    targets: latestTargets,
    evidenceSummary
  }, null, 2), "utf8");

  await writeFile(lastRunPath, JSON.stringify(lastRun, null, 2), "utf8");

  const summaryPath = join(localOutputRoot, `summary-${options.group}.json`);
  await writeFile(summaryPath, JSON.stringify(lastRun, null, 2), "utf8");

  process.stdout.write("\nCurated validation summary\n");
  for (const result of results) {
    const changeNote = result.materiallyChanged ? ` changed=${result.changedFields.join(",") || "yes"}` : " changed=no";
    process.stdout.write(`- ${result.targetId}: ${result.shipRecommendation} (${result.recommendationBasis}) | ${result.detectedCombination} |${changeNote}\n`);
  }
  process.stdout.write(`\nLocal summary: ${summaryPath}\n`);
  process.stdout.write(`Latest snapshot: ${latestPath}\n`);
  process.stdout.write(`Last run: ${lastRunPath}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
