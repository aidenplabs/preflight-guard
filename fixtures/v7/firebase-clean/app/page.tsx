import { initializeApp } from "firebase/app";

const app = initializeApp({
  apiKey: "public-demo-api-key",
  authDomain: "demo-app.firebaseapp.com",
  projectId: "demo-app"
});

export default function Page() {
  return <main>{app.name}</main>;
}
