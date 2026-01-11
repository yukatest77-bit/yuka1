import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface ScrapedPharmacy {
    name: string;
    address: string;
    phone: string;
    dayOfWeek: number;
}

class ScraperService {
    private readonly scraperUrl: string;

    constructor() {
        this.scraperUrl = process.env.SCRAPER_URL || 'https://pharmaciedegardetanger.site/';
    }

    private parsePhoneNumber(phoneText: string): string {
        const phoneMatch = phoneText.match(/[\d\s\-()]+/);
        return phoneMatch ? phoneMatch[0].trim() : phoneText.trim();
    }

    private getDayOfWeek(dayText: string): number {
        // Simplified for test
        return new Date().getDay();
    }

    async scrapePharmacies() {
        try {
            console.log(`🔍 Scraping pharmacies from: ${this.scraperUrl}`);

            const response = await axios.get(this.scraperUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
                },
                timeout: 15000,
            });

            const $ = cheerio.load(response.data);
            const pharmacies: ScrapedPharmacy[] = [];
            const $items = $('.list__');
            console.log(`✅ Found ${$items.length} pharmacies with selector: .list__`);

            $items.each((_, element) => {
                const $item = $(element);
                const name = $item.find('.list__label--name').text().trim();

                if (!name) return;

                let fullText = $item.text().trim().replace(/\s+/g, ' ');
                let address = fullText.replace(name, '').trim();
                address = address.replace(/Tangier Tanger Morocco/gi, '').trim();

                const phoneMatch = fullText.match(/(?:tel|tél|téléphone|phone)?[\s:]*(\d[\d\s\-().]{8,})/i);
                const phone = phoneMatch ? this.parsePhoneNumber(phoneMatch[1]) : 'N/A';
                const dayOfWeek = new Date().getDay();

                if (name && name.length > 3) {
                    pharmacies.push({
                        name,
                        address: address || 'Tangier, Morocco',
                        phone: phone,
                        dayOfWeek,
                    });
                }
            });

            return pharmacies;
        } catch (error) {
            console.error('Scraping error:', error);
            throw error;
        }
    }
}

async function verify() {
    try {
        const service = new ScraperService();
        const pharmacies = await service.scrapePharmacies();

        console.log('\n✅ Scrape successful!');
        console.log(`Found ${pharmacies.length} pharmacies.`);

        if (pharmacies.length > 0) {
            console.log('\n------- First 3 Results -------');
            pharmacies.slice(0, 3).forEach((p, i) => {
                console.log(`\nPharmacy #${i + 1}:`);
                console.log(`Name: ${p.name}`);
                console.log(`Address: ${p.address}`);
                console.log(`Phone: ${p.phone}`);
            });
            console.log('\n-------------------------------');
        }
    } catch (e) {
        console.error(e);
    }
}

verify();
