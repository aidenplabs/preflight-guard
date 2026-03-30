'use client'

import { cert, initializeApp } from "firebase-admin/app";
import serviceAccount from "./firebase-service-account.json";

initializeApp({
  credential: cert({
    projectId: serviceAccount.project_id,
    clientEmail: serviceAccount.client_email,
    privateKey: serviceAccount.private_key
  })
});

export default function Page() {
  return <main>unsafe</main>;
}
