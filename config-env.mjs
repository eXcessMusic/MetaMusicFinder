import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runtimeConfig = `
window.RUNTIME_CONFIG = {
    SPOTIFY_CLIENT_ID: '${process.env.SPOTIFY_CLIENT_ID || ''}',
    SPOTIFY_CLIENT_SECRET: '${process.env.SPOTIFY_CLIENT_SECRET || ''}'
};
`;

fs.writeFileSync(path.join(__dirname, 'src', 'assets', 'runtime-config.js'), runtimeConfig);
console.log('Created runtime-config.js');

// Create a placeholder environment.prod.ts
const productionEnvironmentPath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
const productionEnvironmentContent = `
export const environment = {
    production: true
};
`;
fs.writeFileSync(productionEnvironmentPath, productionEnvironmentContent);
console.log('Created environment.prod.ts');