#!/usr/bin/env tsx
/**
 * Yupoo Album Scraper (Fixed)
 * 
 * Crawls Yupoo albums with proper URL handling and debug artifacts
 * 
 * Usage:
 *   npm run scrape:yupoo -- --baseUrl "https://czyyy268.x.yupoo.com/albums" --maxAlbums 50
 *   npm run scrape:yupoo -- --maxAlbums 2 --debug
 */

import * as cheerio from 'cheerio';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { chromium, Page } from 'playwright';

interface Config {
  baseUrl: string;
  maxAlbums: number;
  maxItemsPerAlbum: number;
  outputCsv: string;
  delayMin: number;
  delayMax: number;
  debug: boolean;
  debugDir: string;
}

interface YupooItem {
  sku?: string;
  title: string;
  album: string;
  imageUrl: string;
  itemUrl: string;
}

interface AlbumInfo {
  url: string;
  title: string;
}

function parseArgs(): Config {
  const args = process.argv.slice(2);
  
  let baseUrl = 'https://czyyy268.x.yupoo.com/albums';
  let maxAlbums = 50;
  let maxItemsPerAlbum = 500;
  let debug = false;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--baseUrl' && args[i + 1]) {
      baseUrl = args[++i];
    } else if (args[i] === '--maxAlbums' && args[i + 1]) {
      maxAlbums = parseInt(args[++i]);
    } else if (args[i] === '--maxItemsPerAlbum' && args[i + 1]) {
      maxItemsPerAlbum = parseInt(args[++i]);
    } else if (args[i] === '--debug') {
      debug = true;
    }
  }
  
  return {
    baseUrl,
    maxAlbums,
    maxItemsPerAlbum,
    outputCsv: join(process.cwd(), 'data/yupoo/products.csv'),
    delayMin: 300,
    delayMax: 800,
    debug,
    debugDir: join(process.cwd(), 'data/yupoo/debug'),
  };
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomDelay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  await delay(ms);
}

function normalizeUrl(href: string, baseUrl: string): string | null {
  try {
    const url = new URL(href, baseUrl);
    const urlStr = url.toString();
    
    // Reject invalid URLs
    if (urlStr.includes('undefined')) return null;
    if (!urlStr.includes('.yupoo.com')) return null;
    
    return urlStr;
  } catch (e) {
    return null;
  }
}

function isValidAlbumUrl(url: string, baseUrl: string): boolean {
  // Must contain /albums/ and have a numeric ID
  if (!url.includes('/albums/')) return false;
  
  // Exclude navigation links
  const excludePatterns = [
    '/undefined',
    'language',
    '个人主页',
    'homepage',
  ];
  
  for (const pattern of excludePatterns) {
    if (url.toLowerCase().includes(pattern.toLowerCase())) {
      return false;
    }
  }
  
  // Check if URL equals baseUrl (just the albums list page)
  if (url === baseUrl || url === baseUrl + '/') {
    return false;
  }
  
  // Must have an ID after /albums/
  const match = url.match(/\/albums\/(\d+)/);
  return match !== null;
}

async function saveDebugArtifacts(
  page: Page,
  name: string,
  debugDir: string
): Promise<void> {
  try {
    const html = await page.content();
    await writeFile(join(debugDir, `${name}.html`), html);
    await page.screenshot({ path: join(debugDir, `${name}.png`), fullPage: true });
  } catch (e) {
    console.log(`    ⚠️  Failed to save debug artifacts: ${e}`);
  }
}

function extractSKU(text: string): string | undefined {
  const patterns = [
    /\b([A-Z]{2,}[-_]?\d{3,6})\b/,
    /\b([A-Z]\d{3,5})\b/,
    /\b(\d{3,4}[A-Z]{1,3})\b/,
    /SKU[:\s]*([A-Za-z0-9-_]+)/i,
    /Item[:\s]*([A-Za-z0-9-_]+)/i,
    /Code[:\s]*([A-Za-z0-9-_]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim().toUpperCase();
    }
  }
  
  return undefined;
}

async function scrapeAlbumListWithPlaywright(
  baseUrl: string,
  maxAlbums: number,
  config: Config
): Promise<AlbumInfo[]> {
  console.log('📚 Using Playwright to discover albums...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();
  
  try {
    console.log('  🌐 Loading albums page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Save debug artifacts
    await saveDebugArtifacts(page, 'albums', config.debugDir);
    console.log(`  📝 Debug: Saved albums.html and albums.png`);
    
    // Try multiple strategies to find albums
    const albums: AlbumInfo[] = [];
    const seenUrls = new Set<string>();
    
    // Strategy 1: Look for album grid/cards
    const albumSelectors = [
      '.album-item a',
      '.album-card a',
      '[class*="album"] a[href*="/albums/"]',
      'a[href*="/albums/"][href*="?"]',
      '.showalbum__children a',
    ];
    
    for (const selector of albumSelectors) {
      const links = await page.$$eval(selector, (elements) => {
        return elements.map(el => ({
          url: el.getAttribute('href') || '',
          title: el.textContent?.trim() || 
                 el.querySelector('img')?.alt ||
                 el.getAttribute('title') || '',
        }));
      });
      
      if (links.length > 0) {
        console.log(`  🔍 Found ${links.length} potential albums with selector: ${selector}`);
        
        for (const link of links) {
          const normalizedUrl = normalizeUrl(link.url, baseUrl);
          if (normalizedUrl && isValidAlbumUrl(normalizedUrl, baseUrl) && !seenUrls.has(normalizedUrl)) {
            seenUrls.add(normalizedUrl);
            albums.push({ url: normalizedUrl, title: link.title || 'Album' });
            if (albums.length >= maxAlbums) break;
          }
        }
        
        if (albums.length > 0) break;
      }
    }
    
    // Strategy 2: If no albums found, try all links with numeric IDs
    if (albums.length === 0) {
      console.log('  🔍 Trying all links with /albums/ pattern...');
      
      const allLinks = await page.$$eval('a[href]', (elements) => {
        return elements.map(el => ({
          url: el.getAttribute('href') || '',
          title: el.textContent?.trim() || '',
        }));
      });
      
      for (const link of allLinks) {
        const normalizedUrl = normalizeUrl(link.url, baseUrl);
        if (normalizedUrl && isValidAlbumUrl(normalizedUrl, baseUrl) && !seenUrls.has(normalizedUrl)) {
          seenUrls.add(normalizedUrl);
          albums.push({ url: normalizedUrl, title: link.title || 'Album' });
          if (albums.length >= maxAlbums) break;
        }
      }
    }
    
    console.log(`  ✅ Found ${albums.length} valid albums`);
    return albums;
    
  } finally {
    await browser.close();
  }
}

async function scrapeAlbumWithPlaywright(
  albumUrl: string,
  albumTitle: string,
  maxItems: number,
  albumIndex: number,
  config: Config
): Promise<YupooItem[]> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  });
  const page = await context.newPage();
  
  try {
    await page.goto(albumUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Save debug artifacts
    await saveDebugArtifacts(page, `album-${albumIndex}`, config.debugDir);
    
    // Wait for photo grid to load
    try {
      await page.waitForSelector('img[src*="yupoo"], .image, [class*="photo"], [class*="item"]', { timeout: 5000 });
    } catch (e) {
      // No items found
    }
    
    // Extract items
    const items: YupooItem[] = [];
    
    // Try to find item links
    const itemSelectors = [
      'a[href*="?uid="]',
      'a[href*="/albums/"][href*="?"]',
      '.photo-item a',
      '.image-item a',
      '[class*="photo"] a[href]',
      '[class*="item"] a[href]',
    ];
    
    let itemLinks: Array<{ url: string; title: string; imageUrl: string }> = [];
    
    for (const selector of itemSelectors) {
      itemLinks = await page.$$eval(selector, (elements) => {
        return elements.map(el => {
          const img = el.querySelector('img');
          let imageUrl = '';
          
          if (img) {
            // Get highest quality image
            imageUrl = img.getAttribute('data-src') || 
                      img.getAttribute('src') || 
                      img.getAttribute('data-original') || '';
            
            // Remove thumbnail parameters
            if (imageUrl.includes('!')) {
              imageUrl = imageUrl.split('!')[0];
            }
          }
          
          return {
            url: el.getAttribute('href') || '',
            title: el.getAttribute('title') || 
                   img?.alt || 
                   el.textContent?.trim() || '',
            imageUrl,
          };
        }).filter(item => item.url && item.imageUrl);
      });
      
      if (itemLinks.length > 0) {
        break;
      }
    }
    
    // Process items
    for (let i = 0; i < Math.min(itemLinks.length, maxItems); i++) {
      const link = itemLinks[i];
      const normalizedUrl = normalizeUrl(link.url, albumUrl);
      
      if (normalizedUrl && link.imageUrl) {
        const sku = extractSKU(link.title);
        
        items.push({
          sku,
          title: link.title.substring(0, 200) || `Item ${i + 1}`,
          album: albumTitle.substring(0, 100),
          imageUrl: link.imageUrl,
          itemUrl: normalizedUrl,
        });
      }
    }
    
    return items;
    
  } catch (e) {
    console.log(`    ⚠️  Error scraping album: ${e}`);
    return [];
  } finally {
    await browser.close();
  }
}

async function saveToCsv(items: YupooItem[], csvPath: string): Promise<void> {
  const rows = items.map(item => {
    const sku = item.sku || '';
    const title = item.title.replace(/"/g, '""');
    const album = item.album.replace(/"/g, '""');
    const imageUrl = item.imageUrl.replace(/"/g, '""');
    const itemUrl = item.itemUrl.replace(/"/g, '""');
    
    return `"${sku}","${title}","${album}","${imageUrl}","${itemUrl}"`;
  });
  
  const csv = 'sku,title,album,image_url,item_url\n' + rows.join('\n');
  
  await mkdir(join(csvPath, '..'), { recursive: true });
  await writeFile(csvPath, csv);
}

async function main() {
  const config = parseArgs();
  
  console.log('🔍 Yupoo Album Scraper (Fixed)\n');
  console.log(`Base URL: ${config.baseUrl}`);
  console.log(`Max Albums: ${config.maxAlbums}`);
  console.log(`Max Items per Album: ${config.maxItemsPerAlbum}`);
  console.log(`Debug Mode: ${config.debug ? 'ON' : 'OFF'}`);
  console.log(`Output: ${config.outputCsv}\n`);
  
  // Create debug directory
  await mkdir(config.debugDir, { recursive: true });
  
  // Discover albums
  const albumInfos = await scrapeAlbumListWithPlaywright(config.baseUrl, config.maxAlbums, config);
  
  console.log(`\n✅ Found ${albumInfos.length} albums\n`);
  
  if (albumInfos.length === 0) {
    console.error('❌ No albums found. Possible reasons:');
    console.error('   - The Yupoo account is private/closed');
    console.error('   - The account requires login');
    console.error('   - Check debug/albums.html and debug/albums.png for details');
    process.exit(1);
  }
  
  // Show first 10 albums
  console.log('📋 First album URLs discovered:');
  albumInfos.slice(0, 10).forEach((album, i) => {
    console.log(`  ${i + 1}. ${album.title}`);
    console.log(`     ${album.url}`);
  });
  console.log();
  
  // Scrape each album
  console.log('📦 Scraping albums...\n');
  const allItems: YupooItem[] = [];
  const albumStats: Array<{ album: string; items: number }> = [];
  
  for (let i = 0; i < albumInfos.length; i++) {
    const albumInfo = albumInfos[i];
    process.stdout.write(`  Album ${(i + 1).toString().padStart(2, '0')}/${albumInfos.length} [${albumInfo.title}]... `);
    
    const items = await scrapeAlbumWithPlaywright(
      albumInfo.url,
      albumInfo.title,
      config.maxItemsPerAlbum,
      i + 1,
      config
    );
    
    if (items.length > 0) {
      console.log(`✅ ${items.length} items`);
      allItems.push(...items);
      albumStats.push({ album: albumInfo.title, items: items.length });
    } else {
      console.log('⏭️  No items');
      albumStats.push({ album: albumInfo.title, items: 0 });
    }
    
    if (i < albumInfos.length - 1) {
      await randomDelay(config.delayMin, config.delayMax);
    }
  }
  
  // Save to CSV
  if (allItems.length === 0) {
    console.error('\n❌ No items scraped. Check debug artifacts in data/yupoo/debug/');
    process.exit(1);
  }
  
  console.log(`\n💾 Saving to CSV...`);
  await saveToCsv(allItems, config.outputCsv);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60) + '\n');
  console.log(`Albums scraped: ${albumInfos.length}`);
  console.log(`Total items: ${allItems.length}`);
  console.log(`Items with SKU: ${allItems.filter(i => i.sku).length}`);
  console.log(`Items without SKU: ${allItems.filter(i => !i.sku).length}\n`);
  
  console.log('📊 Item counts per album:');
  albumStats.forEach(stat => {
    console.log(`  ${stat.album}: ${stat.items} items`);
  });
  console.log();
  
  console.log('📋 First 5 CSV rows:');
  console.log('  sku,title,album,image_url,item_url');
  allItems.slice(0, 5).forEach(item => {
    const sku = item.sku || '(none)';
    const title = item.title.substring(0, 40) + (item.title.length > 40 ? '...' : '');
    console.log(`  ${sku},"${title}",${item.album.substring(0, 20)},...`);
  });
  console.log();
  
  console.log(`📁 Output: ${config.outputCsv}`);
  console.log(`🐛 Debug artifacts: ${config.debugDir}\n`);
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
