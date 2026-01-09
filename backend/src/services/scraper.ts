import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pharmacy, ScrapedPharmacy } from '../types';
import firebaseService from './firebase';

class ScraperService {
  private readonly scraperUrl: string;

  constructor() {
    this.scraperUrl = process.env.SCRAPER_URL || 'https://dimapermanence.site/pharmacies-de-garde-tanger/';
  }

  private parsePhoneNumber(phoneText: string): string {
    // Extract phone number from text, handle various formats
    const phoneMatch = phoneText.match(/[\d\s\-()]+/);
    return phoneMatch ? phoneMatch[0].trim() : phoneText.trim();
  }

  private getDayOfWeek(dayText: string): number {
    // Map day names to numbers (0 = Sunday, 6 = Saturday)
    const dayMap: { [key: string]: number } = {
      'dimanche': 0,
      'lundi': 1,
      'mardi': 2,
      'mercredi': 3,
      'jeudi': 4,
      'vendredi': 5,
      'samedi': 6,
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };

    const normalizedDay = dayText.toLowerCase().trim();
    
    // Check if it's a date, if so extract the day of week
    const dateMatch = dayText.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
    if (dateMatch) {
      const date = new Date(dateMatch[0]);
      if (!isNaN(date.getTime())) {
        return date.getDay();
      }
    }

    // Try to find day name in the text
    for (const [day, number] of Object.entries(dayMap)) {
      if (normalizedDay.includes(day)) {
        return number;
      }
    }

    // Default to current day if not found
    return new Date().getDay();
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

      // Try different selectors based on common patterns
      const possibleSelectors = [
        '.pharmacy-item',
        '.pharmacie',
        'article.pharmacy',
        '.post',
        'article',
        '.entry',
        '.pharmacy-card',
      ];

      let $items = $();
      for (const selector of possibleSelectors) {
        $items = $(selector);
        if ($items.length > 0) {
          console.log(`✅ Found ${$items.length} items with selector: ${selector}`);
          break;
        }
      }

      // If no specific items found, try to parse the entire content
      if ($items.length === 0) {
        console.log('⚠️ No specific pharmacy items found, trying to parse content');
        
        // Look for content that might contain pharmacy information
        const content = $('body').text();
        
        // Split by common patterns
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        
        let currentPharmacy: Partial<ScrapedPharmacy> = {};
        
        lines.forEach((line) => {
          line = line.trim();
          
          // Look for pharmacy names (usually capitalized or contains "pharmacie")
          if (line.match(/pharmacie/i) && line.length < 100) {
            if (currentPharmacy.name && currentPharmacy.address) {
              pharmacies.push(currentPharmacy as ScrapedPharmacy);
            }
            currentPharmacy = {
              name: line,
              address: '',
              phone: '',
              dayOfWeek: new Date().getDay(),
            };
          }
          
          // Look for addresses (contains street keywords)
          if (line.match(/rue|avenue|boulevard|quartier|bd|av\./i) && !currentPharmacy.address) {
            currentPharmacy.address = line;
          }
          
          // Look for phone numbers
          const phoneMatch = line.match(/(?:tel|tél|téléphone|phone)?[\s:]*(\d[\d\s\-().]{8,})/i);
          if (phoneMatch && !currentPharmacy.phone) {
            currentPharmacy.phone = this.parsePhoneNumber(phoneMatch[1]);
          }
        });
        
        // Add last pharmacy if valid
        if (currentPharmacy.name && currentPharmacy.address) {
          pharmacies.push(currentPharmacy as ScrapedPharmacy);
        }
      } else {
        // Parse structured items
        $items.each((_, element) => {
          const $item = $(element);
          
          // Try multiple patterns to extract information
          const name = $item.find('h2, h3, .pharmacy-name, .name, .title').first().text().trim() ||
                       $item.find('strong').first().text().trim() ||
                       $item.find('b').first().text().trim();
          
          const address = $item.find('.address, .location, .adresse').first().text().trim() ||
                         $item.find('p').first().text().trim();
          
          const phoneText = $item.find('.phone, .tel, .telephone').first().text().trim() ||
                           $item.text().match(/(?:tel|tél|téléphone|phone)?[\s:]*(\d[\d\s\-().]{8,})/i)?.[1] || '';
          
          const phone = this.parsePhoneNumber(phoneText);
          
          const dayText = $item.find('.day, .jour').first().text().trim() ||
                         $item.find('.date').first().text().trim();
          
          const dayOfWeek = this.getDayOfWeek(dayText);

          if (name && name.length > 3) {
            pharmacies.push({
              name,
              address: address || 'Tangier, Morocco',
              phone: phone || 'N/A',
              dayOfWeek,
            });
          }
        });
      }

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
