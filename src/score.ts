import type { Finding, ScanResult, StackDetectionResult } from "./types.js";

function hasReliableTargetStack(stack: StackDetectionResult): boolean {
  return stack.profileFit === "strong-match" && stack.overallConfidence === "high";
}

export function decideShipRecommendation(findings: Finding[], stack: StackDetectionResult): ScanResult["shipRecommendation"] {
  const blockerCount = findings.filter((finding) => finding.severity === "Blocker" && finding.confidence === "confirmed").length;
  const highCount = findings.filter((finding) => finding.severity === "High").length;
  const mediumCount = findings.filter((finding) => finding.severity === "Medium").length;

  if (blockerCount > 0) {
    return "no";
  }

  if (highCount >= 2) {
    return "no";
  }

  if (highCount >= 1 || mediumCount >= 1) {
    return "caution";
  }

  if (!hasReliableTargetStack(stack)) {
    return "caution";
  }

  return "yes";
}

export function getExitCode(recommendation: ScanResult["shipRecommendation"]): number {
  switch (recommendation) {
    case "yes":
      return 0;
    case "caution":
      return 1;
    case "no":
      return 2;
  }
}
