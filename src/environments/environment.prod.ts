
export const environment = {
    production: true,
    backendUrl: '/api',  // This will work because Express is serving both the API and the Angular app
    songlinkProxyUrl: '/songlink-api' // New URL for Songlink proxy in production
};
