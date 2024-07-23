import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environmentFilesPath = path.join(__dirname, 'src', 'environments');
const productionEnvironmentPath = path.join(environmentFilesPath, 'environment.prod.ts');

const productionEnvironment = `
export const environment = {
    production: true,
    spotifyClientId: '${process.env.SPOTIFY_CLIENT_ID || ''}',
    spotifyClientSecret: '${process.env.SPOTIFY_CLIENT_SECRET || ''}'
};
`;

fs.writeFileSync(productionEnvironmentPath, productionEnvironment);
console.log('Created environment.prod.ts');