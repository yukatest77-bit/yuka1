import scraperService from '../app/lib/scraper';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
    try {
        console.log('🧪 Verifying scraper logic...');
        console.log('target URL:', process.env.SCRAPER_URL || 'DEFAULT URL');

        const pharmacies = await scraperService.scrapePharmacies();

        console.log('\n✅ Scrape successful!');
        console.log(`Found ${pharmacies.length} pharmacies.`);

        if (pharmacies.length > 0) {
            console.log('\n------- First 3 Results -------');
            pharmacies.slice(0, 3).forEach((p, i) => {
                console.log(`\nPharmacy #${i + 1}:`);
                console.log(`Name: ${p.name}`);
                console.log(`Address: ${p.address}`);
                console.log(`Phone: ${p.phone}`);
                console.log(`Day Info: ${p.dayOfWeek} (Today is: ${new Date().getDay()})`);
            });
            console.log('\n-------------------------------');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verify();
