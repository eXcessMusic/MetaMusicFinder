import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET);

const runtimeConfig = `
window.RUNTIME_CONFIG = {
    SPOTIFY_CLIENT_ID: '${process.env.SPOTIFY_CLIENT_ID || ''}',
    SPOTIFY_CLIENT_SECRET: '${process.env.SPOTIFY_CLIENT_SECRET || ''}'
};
console.log('Runtime config set:', window.RUNTIME_CONFIG);
`;

const runtimeConfigPath = path.join(__dirname, 'src', 'assets', 'runtime-config.js');
fs.writeFileSync(runtimeConfigPath, runtimeConfig);
console.log('Created runtime-config.js at:', runtimeConfigPath);
console.log('Runtime config content:', runtimeConfig);

// Create a placeholder environment.prod.ts
const productionEnvironmentPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
const productionEnvironmentContent = `
export const environment = {
    production: true
};
`;
fs.writeFileSync(productionEnvironmentPath, productionEnvironmentContent);
console.log('Created environment.prod.ts');