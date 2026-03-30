import type { Finding, Rule } from "../types.js";
import {
  isClientReachableFile,
  isEnvFile
} from "../utils.js";
import type { RuleContext } from "../types.js";

function firebaseServiceAccountMaterialRule(context: RuleContext): Finding[] {
  const findings: Finding[] = [];
  const serviceAccountJsonRegex = /"type"\s*:\s*"service_account"|"private_key"\s*:\s*"-----BEGIN PRIVATE KEY-----|"client_email"\s*:\s*".+gserviceaccount\.com"/;

  for (const file of context.files) {
    const isExampleFile = /(^|\/)\.env\.example$|(^|\/)\.env\.sample$|example|sample/i.test(file.path);
    if (isExampleFile) {
      continue;
    }

    const hasServiceAccountJson = serviceAccountJsonRegex.test(file.content);
    const hasDirectPrivateKeyEnv = isEnvFile(file.path) && /FIREBASE_PRIVATE_KEY\s*=/.test(file.content);
    const hasCredentialPathReference = isEnvFile(file.path) && /GOOGLE_APPLICATION_CREDENTIALS\s*=/.test(file.content);

    if (!hasServiceAccountJson && !hasDirectPrivateKeyEnv && !hasCredentialPathReference) {
      continue;
    }

    findings.push({
      ruleId: "FB001",
      title: "Possible Firebase service-account credential material committed in repo",
      severity: hasServiceAccountJson || hasDirectPrivateKeyEnv ? "Blocker" : "High",
      confidence: hasServiceAccountJson || hasDirectPrivateKeyEnv ? "confirmed" : "likely",
      category: "firebase-auth-config",
      filePath: file.path,
      explanation: hasServiceAccountJson
        ? "This file contains Firebase service-account style JSON material."
        : hasDirectPrivateKeyEnv
          ? "This env file directly defines a Firebase private key variable."
          : "This env file references a Google application credentials path, which is risky to commit into app config.",
      whyItMatters: "Firebase Admin credentials can grant privileged project access and should not be committed into source or shared app env files.",
      minimumFix: "Remove committed credential material, move it to a server-only secret manager or CI secret, and rotate the credential if it was real.",
      evidence: hasServiceAccountJson
        ? ["Detected service-account style JSON markers such as `type: service_account`, `private_key`, or a `gserviceaccount.com` client email."]
        : hasDirectPrivateKeyEnv
          ? ["Detected a `FIREBASE_PRIVATE_KEY` assignment in an env file."]
          : ["Detected a `GOOGLE_APPLICATION_CREDENTIALS` assignment in an env file."]
    });
  }

  return findings;
}

function firebaseAdminInClientRule(context: RuleContext): Finding[] {
  const findings: Finding[] = [];

  for (const file of context.files) {
    if (!isClientReachableFile(file)) {
      continue;
    }

    const importsFirebaseAdmin = /from\s+['"]firebase-admin(?:\/app)?['"]|require\(['"]firebase-admin(?:\/app)?['"]\)/.test(file.content);
    const usesAdminCredentialPattern = /cert\(|applicationDefault\(|initializeApp\([\s\S]{0,240}?credential\s*:/.test(file.content);

    if (!importsFirebaseAdmin && !usesAdminCredentialPattern) {
      continue;
    }

    findings.push({
      ruleId: "FB002",
      title: "Firebase Admin usage detected in client-reachable code",
      severity: "Blocker",
      confidence: importsFirebaseAdmin ? "confirmed" : "likely",
      category: "firebase-auth-config",
      filePath: file.path,
      explanation: "This file looks browser-reachable but appears to use Firebase Admin SDK patterns or admin credential setup.",
      whyItMatters: "Firebase Admin code belongs in trusted server-only code. Putting it in client-reachable files risks leaking privileged behavior or credential handling paths.",
      minimumFix: "Move Firebase Admin imports and credential setup into server-only code paths and keep client code limited to the public Firebase web SDK.",
      evidence: importsFirebaseAdmin
        ? ["Client-reachable file imports `firebase-admin`."]
        : ["Client-reachable file contains Firebase Admin credential setup patterns."]
    });
  }

  return findings;
}

export const nextJsFirebaseVercelRules: Rule[] = [
  {
    id: "FB001",
    title: "Possible Firebase service-account credential material committed in repo",
    category: "firebase-auth-config",
    run: firebaseServiceAccountMaterialRule
  },
  {
    id: "FB002",
    title: "Firebase Admin usage detected in client-reachable code",
    category: "firebase-auth-config",
    run: firebaseAdminInClientRule
  }
];
