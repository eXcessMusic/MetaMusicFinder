import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environmentFilesPath = path.join(__dirname, 'src', 'environments');

// Ensure the environments directory exists
if (!fs.existsSync(environmentFilesPath)) {
    fs.mkdirSync(environmentFilesPath, { recursive: true });
}

const environmentPath = path.join(environmentFilesPath, 'environment.ts');
const productionEnvironmentPath = path.join(environmentFilesPath, 'environment.prod.ts');

const environmentContent = `
export const environment = {
    production: false,
    spotifyClientId: '${process.env.SPOTIFY_CLIENT_ID || ''}',
    spotifyClientSecret: '${process.env.SPOTIFY_CLIENT_SECRET || ''}'
};
`;

const productionEnvironmentContent = `
export const environment = {
    production: true,
    spotifyClientId: '${process.env.SPOTIFY_CLIENT_ID || ''}',
    spotifyClientSecret: '${process.env.SPOTIFY_CLIENT_SECRET || ''}'
};
`;

fs.writeFileSync(environmentPath, environmentContent);
console.log('Created environment.ts');

fs.writeFileSync(productionEnvironmentPath, productionEnvironmentContent);
console.log('Created environment.prod.ts');