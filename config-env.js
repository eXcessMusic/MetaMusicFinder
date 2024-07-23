const fs = require("fs");
const path = require("path");

const environmentFilesPath = path.join(__dirname, "src", "environments");
const defaultEnvironmentPath = path.join(
    environmentFilesPath,
    "environment.default.ts"
);
const targetEnvironmentPath = path.join(environmentFilesPath, "environment.ts");
const productionEnvironmentPath = path.join(
    environmentFilesPath,
    "environment.prod.ts"
);

// Copy default environment if target doesn't exist
if (!fs.existsSync(targetEnvironmentPath)) {
    fs.copyFileSync(defaultEnvironmentPath, targetEnvironmentPath);
    console.log("Created environment.ts from default");
}

// Create production environment
const productionEnvironment = `
export const environment = {
    production: true,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
};
`;

fs.writeFileSync(productionEnvironmentPath, productionEnvironment);
console.log("Created environment.prod.ts");
