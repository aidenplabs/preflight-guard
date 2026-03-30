import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Finding, ScanResult, Severity } from "./types.js";

const SEVERITY_ORDER: Severity[] = ["Blocker", "High", "Medium"];

function groupBySeverity(findings: Finding[]): Map<Severity, Finding[]> {
  const grouped = new Map<Severity, Finding[]>();

  for (const severity of SEVERITY_ORDER) {
    grouped.set(severity, findings.filter((finding) => finding.severity === severity));
  }

  return grouped;
}

function formatFindingMarkdown(finding: Finding): string {
  const lines = [
    `### ${finding.title}`,
    `- Rule ID: \`${finding.ruleId}\``,
    `- Severity: **${finding.severity}**`,
    `- Confidence: \`${finding.confidence}\``,
    `- Category: \`${finding.category}\``,
    `- File: \`${finding.filePath}\``,
    `- What was found: ${finding.explanation}`,
    `- Why it matters: ${finding.whyItMatters}`,
    `- Minimum fix: ${finding.minimumFix}`
  ];

  if (finding.evidence && finding.evidence.length > 0) {
    lines.push(`- Evidence: ${finding.evidence.join(" | ")}`);
  }

  return lines.join("\n");
}

export function renderTerminalSummary(result: ScanResult): string {
  const blockerCount = result.findings.filter((finding) => finding.severity === "Blocker").length;
  const highCount = result.findings.filter((finding) => finding.severity === "High").length;
  const mediumCount = result.findings.filter((finding) => finding.severity === "Medium").length;

  const coverageNote = result.stack.overallConfidence === "high"
    ? "Coverage note: target stack confidence is high for this scan, but the result is still heuristic rather than a proof of safety."
    : "Coverage note: target stack confidence is partial or weak, so a clean result is not a strong safety signal.";

  const findingLines = result.findings.length === 0
    ? ["No findings triggered."]
    : result.findings.map((finding) => `- [${finding.severity}] ${finding.ruleId} ${finding.title} (${finding.filePath})`);

  return [
    "Preflight Security Check",
    `Scanned path: ${result.summary.scannedPath}`,
    `Target profile: ${result.stack.profile}`,
    `Stack confidence: ${result.stack.overallConfidence}`,
    `Profile fit: ${result.stack.profileFit}`,
    `Detected stack: ${result.stack.components.map((component) => `${component.name}=${component.detected ? component.confidence : "not-detected"}`).join(", ")}`,
    coverageNote,
    `Findings: ${result.findings.length} total (${blockerCount} Blocker, ${highCount} High, ${mediumCount} Medium)`,
    `Ship recommendation: ${result.shipRecommendation}`,
    "",
    ...findingLines
  ].join("\n");
}

export function renderMarkdownReport(result: ScanResult): string {
  const grouped = groupBySeverity(result.findings);
  const stackLines = result.stack.components.map((component) => {
    const evidence = component.signals.length > 0
      ? component.signals.map((signal) => signal.evidence).join("; ")
      : "No useful signals found.";

    return `- **${component.name}**: ${component.detected ? `detected (${component.confidence}, score ${component.score}/${component.maxScore})` : `not clearly detected (${component.confidence}, score ${component.score}/${component.maxScore})`} — ${evidence}`;
  });

  const sections: string[] = [
    "# Preflight Report",
    "",
    "## Project Summary",
    `- Scanned path: \`${result.summary.scannedPath}\``,
    `- Scanned at: \`${result.summary.scannedAt}\``,
    `- Files scanned: ${result.summary.fileCount}`,
    "",
    "## Detected Stack",
    `- Target profile: \`${result.stack.profile}\``,
    `- Overall confidence: \`${result.stack.overallConfidence}\``,
    `- Profile fit: \`${result.stack.profileFit}\``,
    `- Summary: ${result.stack.summary}`,
    `- Coverage note: ${result.stack.overallConfidence === "high" ? "Target stack confidence is high enough for a useful clean scan signal, but the scan remains heuristic rather than a proof of safety." : "Target stack confidence is partial or weak, so a clean scan should be treated cautiously."}`,
    ...stackLines,
    "",
    "## Findings By Severity"
  ];

  for (const severity of SEVERITY_ORDER) {
    sections.push("");
    sections.push(`## ${severity}`);
    const findings = grouped.get(severity) ?? [];

    if (findings.length === 0) {
      sections.push("No findings in this severity.");
      continue;
    }

    for (const finding of findings) {
      sections.push("");
      sections.push(formatFindingMarkdown(finding));
    }
  }

  sections.push("");
  sections.push("## Final Recommendation");
  sections.push(`- Ship: **${result.shipRecommendation}**`);
  sections.push("");
  sections.push("## Limitations");
  for (const limitation of result.limitations) {
    sections.push(`- ${limitation}`);
  }

  return sections.join("\n");
}

export function renderJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

export async function writeReports(result: ScanResult, outputDirectory: string): Promise<{ markdownPath: string; jsonPath: string }> {
  const markdownPath = join(outputDirectory, "preflight-report.md");
  const jsonPath = join(outputDirectory, "preflight-report.json");

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(markdownPath, renderMarkdownReport(result), "utf8");
  await writeFile(jsonPath, renderJsonReport(result), "utf8");

  return { markdownPath, jsonPath };
}
