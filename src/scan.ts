import { resolve } from "node:path";
import { buildProjectSummary, loadProjectFiles } from "./project.js";
import { renderJsonReport, renderMarkdownReport, renderTerminalSummary, writeReports } from "./reporters.js";
import { runRules } from "./rules.js";
import { decideShipRecommendation, getExitCode } from "./score.js";
import { collectProjectSignals } from "./signals.js";
import { detectStack } from "./stack.js";
import type { ScanResult } from "./types.js";

export type FailOnMode = "no" | "caution" | "never";

export interface ScanOptions {
  targetPath?: string;
  outputDirectory?: string;
  failOn?: FailOnMode;
}

function buildLimitations(stack: ScanResult["stack"]): string[] {
  const limitations = [
    "This scanner uses heuristic static checks only. It does not prove that auth, RLS, or deployment config are safe.",
    "The scanner is intentionally narrow and only looks for a small set of Next.js + Supabase + Vercel patterns.",
    "Findings marked review-needed or likely still need human review against the real app behavior and deployment intent."
  ];

  if (stack.overallConfidence !== "high") {
    limitations.push("Target stack confidence is not high, so a clean result should not be treated as a strong ship signal.");
  }

  return limitations;
}

export async function runScan(options: ScanOptions): Promise<{
  result: ScanResult;
  terminalSummary: string;
  markdownReport: string;
  jsonReport: string;
  markdownPath: string;
  jsonPath: string;
  exitCode: number;
}> {
  const rootPath = resolve(options.targetPath ?? process.cwd());
  const outputDirectory = resolve(options.outputDirectory ?? rootPath);

  const files = await loadProjectFiles(rootPath);
  const signals = collectProjectSignals(files);
  const summary = buildProjectSummary(rootPath, files.length);
  const stack = detectStack(files, signals);
  const findings = runRules({ rootPath, files, stack, signals });
  const shipRecommendation = decideShipRecommendation(findings, stack);
  const defaultExitCode = getExitCode(shipRecommendation);
  const failOn = options.failOn ?? "caution";
  const exitCode = failOn === "never"
    ? 0
    : failOn === "no"
      ? shipRecommendation === "no" ? 2 : 0
      : defaultExitCode;

  const result: ScanResult = {
    schemaVersion: "1",
    summary,
    stack,
    findings,
    shipRecommendation,
    limitations: buildLimitations(stack),
    exitCode
  };

  const terminalSummary = renderTerminalSummary(result);
  const markdownReport = renderMarkdownReport(result);
  const jsonReport = renderJsonReport(result);
  const { markdownPath, jsonPath } = await writeReports(result, outputDirectory);

  return {
    result,
    terminalSummary,
    markdownReport,
    jsonReport,
    markdownPath,
    jsonPath,
    exitCode
  };
}
