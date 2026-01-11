import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env vars from root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
    const url = process.env.SCRAPER_URL || 'https://pharmaciedegardetanger.site/';
    console.log(`\n🚀 Testing Scraper on: ${url}`);
    console.log('----------------------------------------');

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            timeout: 15000, // 15s timeout
        });

        const $ = cheerio.load(response.data);
        const $items = $('.list__');

        console.log(`✅ Connection successful!`);
        console.log(`✅ Found ${$items.length} pharmacies using selector ".list__"`);

        if ($items.length === 0) {
            console.log('⚠️ Warning: No items found. Check selector or site structure.');
            return;
        }

        console.log('\n📝 Extracting first 3 results for verification:');

        $items.slice(0, 3).each((i, element) => {
            const $item = $(element);
            const name = $item.find('.list__label--name').text().trim();
            let fullText = $item.text().trim().replace(/\s+/g, ' ');
            let address = fullText.replace(name, '').trim();
            // Simple cleanup
            address = address.replace(/Tangier Tanger Morocco/gi, '').trim();

            const phoneMatch = fullText.match(/(?:tel|tél|téléphone|phone)?[\s:]*(\d[\d\s\-().]{8,})/i);
            const phone = phoneMatch ? phoneMatch[1] : 'N/A';

            console.log(`\n   🏥 Pharmacy #${i + 1}`);
            console.log(`      Name:    ${name}`);
            console.log(`      Address: ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`);
            console.log(`      Phone:   ${phone}`);
        });

        console.log('\n----------------------------------------');
        console.log('✅ TEST PASSED: The new scraper logic is working correctly.');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        if (error.response) {
            console.error(`Status Code: ${error.response.status}`);
        } else {
            console.error(error.message);
        }
    }
}

verify();
