import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";

const repoRoot = process.cwd();

const cases = [
  {
    id: "sb003",
    targetPath: "fixtures/v3/missing-route-auth",
    expectedRuleId: "SB003",
    expectedBasis: "elevated-review-findings",
    expectedAiHandoffs: 1,
    expectedExecutionPacks: 1,
    expectedBlockerResponsePacks: 0,
    requiredMarkdown: [
      "## Execution Help Packs",
      "#### Ordered Fix Steps",
      "#### Safe Fix Guidance"
    ],
    forbiddenMarkdown: [
      "## Blocker Response Packs",
      "#### Blocker Brief"
    ]
  },
  {
    id: "sb004",
    targetPath: "fixtures/v30/supabase-rls-review",
    expectedRuleId: "SB004",
    expectedBasis: "review-findings",
    expectedAiHandoffs: 1,
    expectedExecutionPacks: 1,
    expectedBlockerResponsePacks: 0,
    requiredMarkdown: [
      "## Execution Help Packs",
      "#### Ordered Fix Steps",
      "#### Safe Fix Guidance"
    ],
    forbiddenMarkdown: [
      "## Blocker Response Packs",
      "#### Blocker Brief"
    ]
  },
  {
    id: "sb001",
    targetPath: "fixtures/v29/browser-service-role-client",
    expectedRuleId: "SB001",
    expectedBasis: "blocker-findings",
    expectedAiHandoffs: 1,
    expectedExecutionPacks: 0,
    expectedBlockerResponsePacks: 1,
    requiredMarkdown: [
      "## Blocker Response Packs",
      "#### Blocker Brief",
      "#### Immediate Containment Priorities",
      "#### Exact File Inspection Targets",
      "#### Explicit Uncertainty / Escalation Note"
    ],
    forbiddenMarkdown: [
      "#### Ordered Fix Steps",
      "#### Safe Fix Guidance",
      "This should solve it",
      "auto-fix"
    ],
    forbiddenJsonKeys: [
      "orderedFixSteps",
      "safeFixGuidance"
    ]
  },
  {
    id: "sb002",
    targetPath: "fixtures/v32/browser-access-token-client",
    expectedRuleId: "SB002",
    expectedBasis: "blocker-findings",
    expectedAiHandoffs: 1,
    expectedExecutionPacks: 0,
    expectedBlockerResponsePacks: 1,
    requiredMarkdown: [
      "## AI Handoff Prompts",
      "### SB002 Privileged non-public Supabase credential used in browser-reachable client setup",
      "## Blocker Response Packs",
      "#### Blocker Brief",
      "#### Immediate Containment Priorities",
      "#### Exact File Inspection Targets",
      "#### Explicit Uncertainty / Escalation Note"
    ],
    forbiddenMarkdown: [
      "#### Ordered Fix Steps",
      "#### Safe Fix Guidance",
      "This should solve it",
      "auto-fix"
    ],
    forbiddenJsonKeys: [
      "orderedFixSteps",
      "safeFixGuidance"
    ]
  },
  {
    id: "env002",
    targetPath: "fixtures/v3/unsafe-public-service-role",
    expectedRuleId: "ENV002",
    expectedBasis: "confirmed-blocker-findings",
    expectedAiHandoffs: 1,
    expectedExecutionPacks: 0,
    expectedBlockerResponsePacks: 1,
    requiredMarkdown: [
      "## Blocker Response Packs",
      "#### Blocker Brief",
      "#### Immediate Containment Priorities",
      "#### Exact File Inspection Targets",
      "#### Explicit Uncertainty / Escalation Note"
    ],
    forbiddenMarkdown: [
      "#### Ordered Fix Steps",
      "#### Safe Fix Guidance",
      "This should solve it",
      "auto-fix"
    ],
    forbiddenJsonKeys: [
      "orderedFixSteps",
      "safeFixGuidance"
    ]
  }
];

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error([
      `Command failed: ${command} ${args.join(" ")}`,
      result.stdout,
      result.stderr
    ].filter(Boolean).join("\n"));
  }

  return result.stdout;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadCaseOutput(caseDefinition) {
  const outputDirectory = `.preflight-v50-${caseDefinition.id}`;

  runCommand("npm", [
    "run",
    "dev",
    "--",
    "scan",
    caseDefinition.targetPath,
    "--output",
    outputDirectory,
    "--fail-on",
    "never"
  ]);

  const markdownPath = resolve(repoRoot, outputDirectory, "preflight-report.md");
  const jsonPath = resolve(repoRoot, outputDirectory, "preflight-report.json");
  const relativeJsonPath = join(outputDirectory, "preflight-report.json");

  const markdown = await readFile(markdownPath, "utf8");
  const json = JSON.parse(await readFile(jsonPath, "utf8"));

  return {
    outputDirectory,
    markdownPath,
    jsonPath,
    relativeJsonPath,
    markdown,
    json
  };
}

function checkIgnored(outputs) {
  runCommand("git", [
    "check-ignore",
    "-v",
    ...outputs.map((output) => output.relativeJsonPath)
  ]);
}

async function main() {
  const results = [];

  for (const caseDefinition of cases) {
    const output = await loadCaseOutput(caseDefinition);
    const findingIds = output.json.findings.map((finding) => finding.ruleId);

    assert(findingIds.includes(caseDefinition.expectedRuleId), `${caseDefinition.id}: missing expected finding ${caseDefinition.expectedRuleId}`);
    assert(output.json.recommendationBasis === caseDefinition.expectedBasis, `${caseDefinition.id}: expected recommendation basis ${caseDefinition.expectedBasis}, got ${output.json.recommendationBasis}`);
    assert(output.json.aiHandoffs.length === caseDefinition.expectedAiHandoffs, `${caseDefinition.id}: expected ${caseDefinition.expectedAiHandoffs} AI handoffs, got ${output.json.aiHandoffs.length}`);
    assert(output.json.executionPacks.length === caseDefinition.expectedExecutionPacks, `${caseDefinition.id}: expected ${caseDefinition.expectedExecutionPacks} execution packs, got ${output.json.executionPacks.length}`);
    assert(output.json.blockerResponsePacks.length === caseDefinition.expectedBlockerResponsePacks, `${caseDefinition.id}: expected ${caseDefinition.expectedBlockerResponsePacks} blocker-response packs, got ${output.json.blockerResponsePacks.length}`);

    for (const snippet of caseDefinition.requiredMarkdown) {
      assert(output.markdown.includes(snippet), `${caseDefinition.id}: missing required markdown snippet "${snippet}"`);
    }

    for (const snippet of caseDefinition.forbiddenMarkdown ?? []) {
      assert(!output.markdown.includes(snippet), `${caseDefinition.id}: found forbidden markdown snippet "${snippet}"`);
    }

    for (const key of caseDefinition.forbiddenJsonKeys ?? []) {
      assert(!JSON.stringify(output.json.blockerResponsePacks).includes(key), `${caseDefinition.id}: blocker-response JSON should not include "${key}"`);
    }

    results.push({
      id: caseDefinition.id,
      output
    });
  }

  checkIgnored(results.map((result) => result.output));

  const summary = results.map((result) => {
    const { json } = result.output;
    return {
      caseId: result.id,
      recommendationBasis: json.recommendationBasis,
      aiHandoffs: json.aiHandoffs.length,
      executionPacks: json.executionPacks.length,
      blockerResponsePacks: json.blockerResponsePacks.length
    };
  });

  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
