import { readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const repoRoot = process.cwd();
const localOutputRoot = resolve(repoRoot, ".preflight-curated");
const latestPath = join(localOutputRoot, "latest.json");
const lastRunPath = join(localOutputRoot, "last-run.json");
const reportJsonPath = join(localOutputRoot, "report.json");
const reportMarkdownPath = join(localOutputRoot, "report.md");

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function groupBy(values, key) {
  return values.reduce((result, value) => {
    const groupKey = value[key];
    result[groupKey] ??= [];
    result[groupKey].push(value);
    return result;
  }, {});
}

function findRecords(records, ids) {
  return ids.map((id) => records.find((record) => record.targetId === id)).filter(Boolean);
}

function summarizeStablePatterns(records, stableTargets) {
  const stableRecords = findRecords(records, stableTargets);
  const stableCleanControls = stableRecords.filter((record) => (
    record.sourceType === "local-control"
    && record.shipRecommendation === "yes"
    && record.recommendationBasis === "clean-supported-scan"
  ));
  const stableBlockerControls = stableRecords.filter((record) => (
    record.sourceType === "local-control"
    && record.shipRecommendation === "no"
  ));
  const stableElevatedReviewControls = stableRecords.filter((record) => (
    record.sourceType === "local-control"
    && record.recommendationBasis === "elevated-review-findings"
  ));

  const patterns = [];

  if (stableCleanControls.length >= 3) {
    patterns.push("all three clean local supported controls stayed stable on repeat run");
  }

  if (stableBlockerControls.length >= 2) {
    patterns.push("both local blocker controls stayed stable on repeat run");
  }

  if (stableElevatedReviewControls.length >= 1) {
    patterns.push("the local elevated-review auth control stayed stable on repeat run");
  }

  return patterns;
}

function summarizeFixtureOnlyEvidence(records) {
  const findingCoverage = new Map();

  for (const record of records) {
    for (const findingId of record.findingIds) {
      const coverage = findingCoverage.get(findingId) ?? new Set();
      coverage.add(record.sourceType);
      findingCoverage.set(findingId, coverage);
    }
  }

  return Array.from(findingCoverage.entries())
    .filter(([, sourceTypes]) => !sourceTypes.has("public-anchor"))
    .map(([findingId, sourceTypes]) => ({
      findingId,
      note: `currently backed only by ${Array.from(sourceTypes).join(", ")} evidence`
    }));
}

function summarizeMissingPublicProof(records) {
  const publicRecords = records.filter((record) => record.sourceType === "public-anchor");
  const publicVercelClean = publicRecords.filter((record) => (
    record.detectedCombination === "Next.js + Vercel" && record.shipRecommendation === "yes"
  ));
  const publicElevatedReview = publicRecords.filter((record) => record.recommendationBasis === "elevated-review-findings");
  const publicBlockers = publicRecords.filter((record) => record.shipRecommendation === "no");

  const gaps = [];

  if (publicElevatedReview.length === 0) {
    gaps.push("no public supported-elevated-review anchor yet");
  }

  if (publicBlockers.length === 0) {
    gaps.push("no public blocker anchor yet");
  }

  if (publicVercelClean.length < 2) {
    gaps.push("only one public clean Next.js + Vercel anchor");
  }

  return gaps;
}

function recommendNextTargets(records) {
  return records
    .filter((record) => record.sourceType === "deeper-local-only")
    .map((record) => ({
      targetId: record.targetId,
      reference: record.reference,
      why: "still local-only; keep it as a candidate only if it closes a proof gap without weakening the curation bar"
    }));
}

function summarizeLatest(latest, lastRun) {
  const records = Object.values(latest.targets);
  const bySourceType = groupBy(records, "sourceType");
  const byRecommendation = groupBy(records, "shipRecommendation");
  const byBasis = groupBy(records, "recommendationBasis");

  const stableTargets = lastRun?.stableTargets ?? [];
  const changedTargets = lastRun?.changedTargets ?? [];

  const publicElevatedReviewCount = records.filter((record) => (
    record.sourceType === "public-anchor" && record.recommendationBasis === "elevated-review-findings"
  )).length;

  return {
    updatedAt: latest.updatedAt,
    totalTargets: records.length,
    sourceTypeCounts: Object.fromEntries(Object.entries(bySourceType).map(([key, value]) => [key, value.length])),
    recommendationCounts: Object.fromEntries(Object.entries(byRecommendation).map(([key, value]) => [key, value.length])),
    recommendationBasisCounts: Object.fromEntries(Object.entries(byBasis).map(([key, value]) => [key, value.length])),
    stableTargets,
    changedTargets,
    stableRepeatedPatterns: summarizeStablePatterns(records, stableTargets),
    fixtureOnlyEvidence: summarizeFixtureOnlyEvidence(records),
    missingPublicProofAreas: summarizeMissingPublicProof(records),
    strongestCurrentEvidence: latest.evidenceSummary.strongestCurrentEvidence,
    weakestCurrentEvidence: latest.evidenceSummary.weakestCurrentEvidence,
    candidateProductImprovements: latest.evidenceSummary.candidateProductImprovements,
    nextCuratedTargets: recommendNextTargets(records),
    decisionSignals: {
      scannerLogicChangeJustified: false,
      scannerLogicReason: publicElevatedReviewCount > 0
        ? "The current curated set includes a public elevated-review anchor and still behaves coherently, but the public proof set is not yet broad enough to justify tuning logic."
        : "The current curated set shows expected behavior across clean, caution, blocker, and review-only cases, but public elevated-review proof is still too thin to justify tuning logic.",
      aiHandoffRefinementJustified: false,
      aiHandoffReason: "Current validation data points to real-usage follow-up on SB001 and ENV002 before any new prompt or wording change."
    }
  };
}

function renderMarkdown(summary) {
  const lines = [
    "# Curated Validation Report",
    "",
    `- Updated at: \`${summary.updatedAt}\``,
    `- Total targets: ${summary.totalTargets}`,
    "",
    "## Stable vs Changed",
    `- Stable in last run: ${summary.stableTargets.length > 0 ? summary.stableTargets.join(", ") : "none"}`,
    `- Changed in last run: ${summary.changedTargets.length > 0 ? summary.changedTargets.join(", ") : "none"}`,
    "",
    "## Coverage Counts"
  ];

  for (const [key, value] of Object.entries(summary.sourceTypeCounts)) {
    lines.push(`- Source type \`${key}\`: ${value}`);
  }

  for (const [key, value] of Object.entries(summary.recommendationCounts)) {
    lines.push(`- Recommendation \`${key}\`: ${value}`);
  }

  lines.push("");
  lines.push("## Stable Repeated Patterns");
  for (const pattern of summary.stableRepeatedPatterns) {
    lines.push(`- ${pattern}`);
  }
  if (summary.stableRepeatedPatterns.length === 0) {
    lines.push("- none yet");
  }

  lines.push("");
  lines.push("## Fixture-Only Evidence");
  for (const item of summary.fixtureOnlyEvidence) {
    lines.push(`- \`${item.findingId}\`: ${item.note}`);
  }
  if (summary.fixtureOnlyEvidence.length === 0) {
    lines.push("- none");
  }

  lines.push("");
  lines.push("## Missing Public-Proof Areas");
  for (const item of summary.missingPublicProofAreas) {
    lines.push(`- ${item}`);
  }
  if (summary.missingPublicProofAreas.length === 0) {
    lines.push("- none");
  }

  lines.push("");
  lines.push("## Strongest Current Evidence");
  for (const item of summary.strongestCurrentEvidence) {
    lines.push(`- \`${item.targetId}\`: ${item.reason}`);
  }

  lines.push("");
  lines.push("## Weakest Current Evidence");
  for (const item of summary.weakestCurrentEvidence) {
    lines.push(`- \`${item.area}\`: ${item.note}`);
  }

  lines.push("");
  lines.push("## Decision Signals");
  lines.push(`- Scanner logic change justified now: ${summary.decisionSignals.scannerLogicChangeJustified ? "yes" : "no"}`);
  lines.push(`- Scanner logic note: ${summary.decisionSignals.scannerLogicReason}`);
  lines.push(`- AI handoff refinement justified now: ${summary.decisionSignals.aiHandoffRefinementJustified ? "yes" : "no"}`);
  lines.push(`- AI handoff note: ${summary.decisionSignals.aiHandoffReason}`);

  lines.push("");
  lines.push("## Candidate Product Improvements");
  for (const [group, suggestions] of Object.entries(summary.candidateProductImprovements)) {
    lines.push(`### ${group}`);
    if (suggestions.length === 0) {
      lines.push("- none");
      continue;
    }

    for (const suggestion of suggestions) {
      lines.push(`- ${suggestion}`);
    }
  }

  lines.push("");
  lines.push("## Best Next Curated Targets");
  for (const target of summary.nextCuratedTargets) {
    lines.push(`- \`${target.targetId}\` (${target.reference}): ${target.why}`);
  }
  if (summary.nextCuratedTargets.length === 0) {
    lines.push("- none");
  }

  return lines.join("\n");
}

async function main() {
  const latest = await loadJson(latestPath);
  const lastRun = await loadJson(lastRunPath);
  const summary = summarizeLatest(latest, lastRun);
  const markdown = renderMarkdown(summary);

  await writeFile(reportJsonPath, JSON.stringify(summary, null, 2), "utf8");
  await writeFile(reportMarkdownPath, markdown, "utf8");

  process.stdout.write(markdown);
  process.stdout.write(`\n\nLocal report JSON: ${reportJsonPath}\n`);
  process.stdout.write(`Local report Markdown: ${reportMarkdownPath}\n`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
