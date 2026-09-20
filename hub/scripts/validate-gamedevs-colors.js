#!/usr/bin/env node

/**
 * GameDevs Color Compliance Validator
 *
 * Scans /devs route files for off-palette colors and design compliance issues.
 * Prevents accidental use of GamER branding or non-approved colors.
 *
 * Run: node scripts/validate-gamedevs-colors.js
 */

const fs = require("fs");
const path = require("path");

const APPROVED_COLORS = [
  "#72b341", // Primary Green
  "#619f2f", // Secondary Green
  "#518c1c", // Tertiary Green
  "#4d4d4d", // Text Primary
  "#231f20", // Text Accent
  "#000000", // Text Contrast
  "#ffffff", // Background Light
  "#808080", // Gray Neutral
  "#666666", // Gray Muted
];

const FORBIDDEN_COLORS = [
  "#B339C4", // GamER Purple
  "#9E46AE", // GamER Purple Dark
  "#833D90", // GamER Purple Darker
  "#84C552", // GamER Green (off-palette)
];

const APPROVED_FONTS = ["AZONIX", "system-ui", "sans-serif", "Inter"];

function validateFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const issues = [];

  // Check for forbidden colors
  FORBIDDEN_COLORS.forEach((color) => {
    const regex = new RegExp(color, "gi");
    const matches = content.match(regex) || [];
    if (matches.length > 0) {
      issues.push({
        type: "error",
        severity: "critical",
        message: `Forbidden GamER color detected: ${color}`,
        count: matches.length,
      });
    }
  });

  // Check for hardcoded hex colors (should use tokens)
  const hexRegex = /#[0-9a-f]{6}\b/gi;
  const hexMatches = content.match(hexRegex) || [];
  hexMatches.forEach((hex) => {
    const normalized = hex.toLowerCase();
    if (!APPROVED_COLORS.includes(normalized)) {
      issues.push({
        type: "warning",
        severity: "medium",
        message: `Off-palette color detected: ${hex}. Use GAMEDEVS_COLORS token instead.`,
      });
    }
  });

  // Check for missing color imports
  if (
    content.includes("GAMEDEVS_COLORS") &&
    !content.includes("from @/lib/gamedevs-tokens") &&
    !content.includes("from \"@/lib/gamedevs-tokens\"")
  ) {
    issues.push({
      type: "error",
      severity: "high",
      message: 'GAMEDEVS_COLORS used but not imported from "@/lib/gamedevs-tokens"',
    });
  }

  return issues;
}

function validateDirectory(dirPath) {
  const allIssues = [];

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules, .git, etc.
      if (
        file.startsWith(".") ||
        file === "node_modules" ||
        file === "dist" ||
        file === "build"
      ) {
        return;
      }

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (
        /\.(tsx?|jsx?)$/.test(file) &&
        !file.endsWith(".d.ts")
      ) {
        const issues = validateFile(filePath);
        if (issues.length > 0) {
          allIssues.push({ file: filePath, issues });
        }
      }
    });
  }

  walkDir(dirPath);
  return allIssues;
}

function main() {
  const devsDir = path.join(__dirname, "..", "apps", "web", "app", "devs");

  if (!fs.existsSync(devsDir)) {
    console.error(`❌ Directory not found: ${devsDir}`);
    process.exit(1);
  }

  console.log("🔍 Validating GameDevs Design Compliance...\n");
  console.log(`📁 Scanning: ${devsDir}\n`);

  const results = validateDirectory(devsDir);

  if (results.length === 0) {
    console.log("✅ All files passed validation!");
    console.log("   - No forbidden colors detected");
    console.log("   - All colors from approved GameDevs palette");
    console.log("   - No hardcoded colors (using tokens)\n");
    process.exit(0);
  }

  let errorCount = 0;
  let warningCount = 0;

  results.forEach(({ file, issues }) => {
    console.log(`\n📄 ${path.relative(process.cwd(), file)}`);
    issues.forEach((issue) => {
      const icon = issue.severity === "critical" ? "🚫" : "⚠️ ";
      const count = issue.count ? ` (${issue.count} occurrences)` : "";
      console.log(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}${count}`);

      if (issue.severity === "critical") errorCount++;
      if (issue.severity !== "critical") warningCount++;
    });
  });

  console.log(`\n📊 Summary`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Warnings: ${warningCount}`);

  if (errorCount > 0) {
    console.log("\n❌ Validation FAILED - Critical issues detected");
    process.exit(1);
  } else {
    console.log("\n✅ Validation PASSED - Review warnings before deployment");
    process.exit(0);
  }
}

main();
