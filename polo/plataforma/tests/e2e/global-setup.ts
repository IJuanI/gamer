import { execSync } from "node:child_process";

export default async function globalSetup() {
  // Reset the test database before all tests to ensure consistent state.
  console.log("Resetting test database...");
  execSync("npm run setup", { stdio: "inherit" });
}
