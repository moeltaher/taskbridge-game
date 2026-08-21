import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/e2e',
  fullyParallel:false,
  retries:1,
  reporter:'list',
  use:{
    baseURL:'http://127.0.0.1:4173',
    trace:'retain-on-failure'
  },
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome']}},
    {name:'mobile-chromium',use:{...devices['Pixel 7']}}
  ],
  webServer:{
    command:'node scripts/serve-static.mjs 4173',
    url:'http://127.0.0.1:4173',
    reuseExistingServer:true,
    timeout:15000
  }
});
