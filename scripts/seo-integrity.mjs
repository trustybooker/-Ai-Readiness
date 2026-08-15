import fs from 'node:fs';
import path from 'node:path';

const failures=[];
const CANONICAL_ORIGIN='https://www.aikollege.com';
const excluded=new Set(['404.html','owner.html','thanks.html','purchase-success.html']);
const htmlFiles=fs.readdirSync('.').filter(f=>f.endsWith('.html')&&!excluded.has(f));
const answerFiles=fs.existsSync('answer')?fs.readdirSync('answer').filter(f=>f.endsWith('.html')).map(f=>`answer/${f}`):[];
const publicFiles=[...htmlFiles,...answerFiles];
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const locSet=new Set(locs);
if(locSet.size!==locs.length)failures.push('sitemap.xml contains duplicate URLs');

function attr(html,tag,name){const re=new RegExp(`<${tag}\\b[^>]*\\b${name}=["']([^"']+)["'][^>]*>`,'i');return html.match(re)?.[1]||'';}
function meta(html,name,property=false){const key=property?'property':'name';const re=new RegExp(`<meta\\b(?=[^>]*\\b${key}=["']${name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'])(?=[^>]*\\bcontent=["']([^"']*)["'])[^>]*>`,'i');return html.match(re)?.[1]||'';}
function canonical(html){return html.match(/<link\b(?=[^>]*rel=["']canonical["'])(?=[^>]*href=["']([^"']+)["'])[^>]*>/i)?.[1]||'';}
function count(html,re){return [...html.matchAll(re)].length;}
function expectedUrl(file){return file==='index.html'?`${CANONICAL_ORIGIN}/`:`${CANONICAL_ORIGIN}/${file}`;}

for(const file of publicFiles){
  const html=fs.readFileSync(file,'utf8');
  const title=(html.match(/<title>([^<]+)<\/title>/i)?.[1]||'').trim();
  const desc=meta(html,'description');
  const robots=meta(html,'robots').toLowerCase();
  const canon=canonical(html);
  const expected=expectedUrl(file);
  const h1s=count(html,/<h1\b/gi);
  const lang=attr(html,'html','lang');
  if(!title||title.length>70)failures.push(`${file}: missing or overlong title (${title.length})`);
  if(!desc||desc.length<50||desc.length>180)failures.push(`${file}: meta description should be 50-180 chars (${desc.length})`);
  if(lang!=='en')failures.push(`${file}: html lang must be en`);
  if(!/name=["']viewport["']/i.test(html))failures.push(`${file}: viewport meta missing`);
  if(h1s!==1)failures.push(`${file}: expected exactly one h1, found ${h1s}`);
  if(canon!==expected)failures.push(`${file}: canonical mismatch; expected ${expected}, found ${canon||'(missing)'}`);
  if(/ai-readiness-pass\.netlify\.app|https:\/\/aikollege\.com(?:\/|["'])/i.test(html))failures.push(`${file}: legacy/non-www production origin found`);
  if(/\b(?:TODO|TBD|lorem ipsum|coming soon)\b/i.test(html))failures.push(`${file}: placeholder language found`);
  if(/href=["'](?:#|javascript:|)["']/i.test(html))failures.push(`${file}: empty/non-navigable href found`);
  const ids=[...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m=>m[1]);
  const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
  if(duplicateIds.length)failures.push(`${file}: duplicate id(s): ${[...new Set(duplicateIds)].join(', ')}`);
  for(const img of html.matchAll(/<img\b[^>]*>/gi))if(!/\balt=["'][^"']*["']/i.test(img[0]))failures.push(`${file}: img without alt attribute`);
  for(const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)){
    try{JSON.parse(block[1]);}catch{failures.push(`${file}: invalid JSON-LD`);}
  }
  if(!robots.includes('noindex')&&!locSet.has(expected))failures.push(`${file}: indexable canonical missing from sitemap`);
}

for(const url of locs){
  if(!url.startsWith(`${CANONICAL_ORIGIN}/`))failures.push(`sitemap.xml non-canonical origin: ${url}`);
  const rel=url===`${CANONICAL_ORIGIN}/`?'index.html':url.slice(`${CANONICAL_ORIGIN}/`.length);
  if(!fs.existsSync(rel))failures.push(`sitemap.xml points to missing file: ${rel}`);
  else if(rel.endsWith('.html')){
    const html=fs.readFileSync(rel,'utf8');
    if(meta(html,'robots').toLowerCase().includes('noindex'))failures.push(`sitemap.xml includes noindex page: ${rel}`);
    const canon=canonical(html);
    if(canon!==url)failures.push(`sitemap/canonical disagreement for ${rel}`);
  }
}

const robots=fs.readFileSync('robots.txt','utf8');
if(!robots.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`))failures.push('robots.txt sitemap declaration is wrong');
const config=fs.readFileSync('assets/site-config.js','utf8');
if(!config.includes('window.AIKOLLEGE_SITE_CONFIG'))failures.push('canonical AI Kollege config global missing');
if(!config.includes("provider: 'google-analytics-4'")||!config.includes("googleAnalyticsId: 'G-P4TR060PFF'"))failures.push('production GA4 configuration missing or mismatched');
const app=fs.readFileSync('assets/app.js','utf8');
if(!app.includes("provider==='google-analytics-4'"))failures.push('GA4 loader does not honor analytics provider');
if(app.includes("return['Business AI Readiness Audit','Map the workflow"))failures.push('quick score can still auto-prescribe paid business audit without context');
const netlify=fs.readFileSync('netlify.toml','utf8');
for(const origin of ['https://aikollege.com/*','https://ai-readiness-pass.netlify.app/*'])if(!netlify.includes(origin))failures.push(`canonical host redirect missing: ${origin}`);
if(!netlify.includes('Strict-Transport-Security'))failures.push('HSTS header missing');

if(failures.length){console.error('SEO/AEO/public integrity audit failed:');for(const f of failures)console.error('- '+f);process.exit(1);}
console.log(`SEO/AEO/public integrity audit passed for ${publicFiles.length} indexable-content pages and ${locs.length} sitemap URLs.`);
