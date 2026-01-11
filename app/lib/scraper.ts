import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pharmacy, ScrapedPharmacy } from './types';
import firebaseService from './firebase';

class ScraperService {
    private readonly scraperUrl: string;

    constructor() {
        this.scraperUrl = process.env.SCRAPER_URL || 'https://pharmaciedegardetanger.site/';
    }

    private parsePhoneNumber(phoneText: string): string {
        // Extract phone number from text, handle various formats
        const phoneMatch = phoneText.match(/[\d\s\-()]+/);
        return phoneMatch ? phoneMatch[0].trim() : phoneText.trim();
    }

    private async geocodeAddress(_address: string): Promise<{ latitude: number; longitude: number } | null> {
        try {
            // For now, return null. In production, you'd use Google Maps Geocoding API
            // or another geocoding service with proper API key

            // Placeholder coordinates for Tangier city center
            // In production, implement proper geocoding
            const tangerCenter = { latitude: 35.7595, longitude: -5.8340 };

            // Add some random offset to simulate different locations
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;

            return {
                latitude: tangerCenter.latitude + latOffset,
                longitude: tangerCenter.longitude + lngOffset,
            };
        } catch (error) {
            console.error('Error geocoding address:', error);
            return null;
        }
    }

    async scrapePharmacies(): Promise<ScrapedPharmacy[]> {
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

            // Update selector for the new site
            const $items = $('.list__');
            console.log(`✅ Found ${$items.length} pharmacies with selector: .list__`);

            $items.each((_, element) => {
                const $item = $(element);

                // Extract Name
                const name = $item.find('.list__label--name').text().trim();

                if (!name) return; // Skip if no name

                // Extract Address
                // The address is usually the text content minus the name
                let fullText = $item.text().trim().replace(/\s+/g, ' ');
                // Remove the name from the full text to get address + other info
                let address = fullText.replace(name, '').trim();

                // Clean up common suffix if present
                address = address.replace(/Tangier Tanger Morocco/gi, '').trim();

                // Phone - Attempt to find it 
                const phoneMatch = fullText.match(/(?:tel|tél|téléphone|phone)?[\s:]*(\d[\d\s\-().]{8,})/i);
                const phone = phoneMatch ? this.parsePhoneNumber(phoneMatch[1]) : 'N/A';

                // Day of week - Assume "Guard" means open tonight (current logic sets open based on day match)
                // Since scraping usually happens for "Today", we default to current day so logic considers them open
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

            console.log(`✅ Scraped ${pharmacies.length} pharmacies`);
            return pharmacies;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('❌ Scraping error:', error.message);
                if (error.response) {
                    console.error('Response status:', error.response.status);
                }
            } else {
                console.error('❌ Scraping error:', error);
            }
            throw error;
        }
    }

    async scrapeAndSave(): Promise<{ success: boolean; count: number; message: string }> {
        try {
            console.log('🚀 Starting scrape and save process...');

            // Scrape pharmacies
            const scrapedPharmacies = await this.scrapePharmacies();

            if (scrapedPharmacies.length === 0) {
                return {
                    success: false,
                    count: 0,
                    message: 'No pharmacies found during scraping',
                };
            }

            // Clear existing data
            await firebaseService.clearAllPharmacies();

            // Convert scraped data to Pharmacy objects with geocoding
            const pharmacies: Pharmacy[] = [];
            const currentDay = new Date().getDay();

            for (const scraped of scrapedPharmacies) {
                const coords = await this.geocodeAddress(scraped.address);

                pharmacies.push({
                    name: scraped.name,
                    address: scraped.address,
                    phone: scraped.phone,
                    latitude: coords?.latitude,
                    longitude: coords?.longitude,
                    isOpen: scraped.dayOfWeek === currentDay,
                    dayOfWeek: scraped.dayOfWeek,
                    updatedAt: Date.now(),
                });
            }

            // Save to Firebase
            await firebaseService.savePharmacies(pharmacies);

            return {
                success: true,
                count: pharmacies.length,
                message: `Successfully scraped and saved ${pharmacies.length} pharmacies`,
            };
        } catch (error) {
            console.error('❌ Error in scrapeAndSave:', error);
            return {
                success: false,
                count: 0,
                message: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    async updateOpenStatus(): Promise<void> {
        try {
            console.log('🔄 Updating pharmacy open status...');
            await firebaseService.updatePharmaciesOpenStatus();
            console.log('✅ Pharmacy open status updated');
        } catch (error) {
            console.error('❌ Error updating open status:', error);
            throw error;
        }
    }
}

const scraperService = new ScraperService();
export default scraperService;
