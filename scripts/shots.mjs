import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { existsSync, mkdirSync } from 'node:fs';

const PORT = 4319, BASE = `http://localhost:${PORT}`;
mkdirSync('shots', { recursive: true });
const server = spawn('npx', ['vite','preview','--port',String(PORT),'--strictPort'], { stdio:'ignore' });
for (let i=0;i<60;i++){ try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }

const browser = await chromium.launch(existsSync('/opt/pw-browsers/chromium')
  ? { executablePath: '/opt/pw-browsers/chromium', args:['--no-sandbox'] } : {});
const page = await (await browser.newContext({ viewport:{width:1280,height:860}, deviceScaleFactor:1, serviceWorkers:'block' })).newPage();

const shots = [
  ['home', '/', null],
  ['level-picker', '/addition', null],
  ['addition', '/addition', 'play'],
  ['clock', '/clock', 'play'],
  ['shapes', '/shape-match', 'play'],
  ['counting', '/counting', 'play'],
];
for (const [name, route, mode] of shots) {
  await page.goto(BASE+route, { waitUntil:'domcontentloaded' });
  if (mode === 'play') { await page.waitForSelector('.level-tile'); await page.locator('.level-tile').nth(3).click(); await sleep(700); }
  await sleep(500);
  await page.screenshot({ path:`shots/${name}.png` });
}

const m = await (await browser.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true, serviceWorkers:'block' })).newPage();
for (const [name, route, mode] of [['m-home','/',null],['m-addition','/addition','play'],['m-memory','/memory','play']]) {
  await m.goto(BASE+route, { waitUntil:'domcontentloaded' });
  if (mode === 'play') { await m.waitForSelector('.level-tile'); await m.locator('.level-tile').first().click(); await sleep(700); }
  await sleep(400);
  await m.screenshot({ path:`shots/${name}.png` });
}
await browser.close(); server.kill('SIGTERM');
console.log('shots done');
