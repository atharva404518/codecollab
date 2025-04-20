const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Path to .env file
const envPath = path.resolve(__dirname, ".env");
console.log(`Checking .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

// Read the raw content of the .env file
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log("\nRaw .env file content (with sensitive values masked):");
  const maskedContent = envContent
    .split("\n")
    .map((line) => {
      // Mask sensitive values but show variable names
      if (line.includes("=") && !line.startsWith("#")) {
        const [key, value] = line.split("=");
        return `${key}=${value ? "[VALUE MASKED]" : ""}`;
      }
      return line;
    })
    .join("\n");
  console.log(maskedContent);
}

// Load environment variables
dotenv.config({ path: envPath });

// Check which variables are loaded
console.log("\nLoaded environment variables:");
console.log("SUPABASE_URL exists:", !!process.env.SUPABASE_URL);
console.log("SUPABASE_URI exists:", !!process.env.SUPABASE_URI);
console.log("SUPABASE_ANON_KEY exists:", !!process.env.SUPABASE_ANON_KEY);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY exists:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log("\nAll environment variable keys:");
console.log(
  Object.keys(process.env)
    .filter((key) => key.includes("SUPA") || key.includes("DATABASE"))
    .join(", ")
);
