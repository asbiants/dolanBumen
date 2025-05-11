const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ENV_FILE_PATH = path.join(__dirname, "..", ".env.local");

// Default environment variables for the application
const DEFAULT_ENV_VARS = {
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
    "pk.eyJ1IjoiZmFuenJ1IiwiYSI6ImNscWx2bnZpejFmcGQya3Bhb3JucHpwY20ifQ.yBKvSNr9b9zpSJ-lqE7gOQ",
  DATABASE_URL: "postgresql://postgres:password@localhost:5432/tourism_db",
  NEXTAUTH_URL: "http://localhost:3001",
  NEXTAUTH_SECRET: crypto.randomBytes(32).toString("hex"),
  XENDIT_API_KEY: "xnd_development_your_key_here",
  XENDIT_WEBHOOK_TOKEN: "your_webhook_token",
  NEXT_PUBLIC_APP_URL: "http://localhost:3001",
};

// Check if .env.local exists
if (!fs.existsSync(ENV_FILE_PATH)) {
  console.log("Creating .env.local file with default values...");

  // Build the file content
  const envFileContent = Object.entries(DEFAULT_ENV_VARS)
    .map(([key, value]) => `${key}="${value}"`)
    .join("\n");

  // Write the file
  fs.writeFileSync(ENV_FILE_PATH, envFileContent);

  console.log(".env.local file created successfully!");
  console.log("-------------------------------------------------");
  console.log("Please edit the file with your actual credentials.");
  console.log("-------------------------------------------------");
} else {
  console.log(".env.local file already exists.");
  console.log("Checking for missing variables...");

  // Read existing file
  const existingContent = fs.readFileSync(ENV_FILE_PATH, "utf8");
  const existingVars = {};

  // Parse existing variables
  existingContent.split("\n").forEach((line) => {
    if (line.trim() === "" || line.startsWith("#")) return;
    const match = line.match(/^([^=]+)=["']?([^"']*)["']?$/);
    if (match) {
      const [, key, value] = match;
      existingVars[key.trim()] = value.trim();
    }
  });

  // Check for missing variables
  let missingVars = [];
  for (const key of Object.keys(DEFAULT_ENV_VARS)) {
    if (!existingVars[key]) {
      missingVars.push(key);
    }
  }

  if (missingVars.length > 0) {
    console.log(
      `Found ${missingVars.length} missing variables. Adding them to .env.local...`
    );

    let appendContent = "\n# Added missing variables\n";
    missingVars.forEach((key) => {
      appendContent += `${key}="${DEFAULT_ENV_VARS[key]}"\n`;
    });

    fs.appendFileSync(ENV_FILE_PATH, appendContent);
    console.log("Variables added successfully!");
  } else {
    console.log("All required variables are present in .env.local");
  }
}

console.log("\nEnvironment setup complete!");
