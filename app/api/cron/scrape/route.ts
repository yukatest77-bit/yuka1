import { NextResponse } from 'next/server';
import scraperService from '@/app/lib/scraper';

// Support both POST (manual) and GET (cron services)
async function handleScrape() {
    try {
        console.log('📥 Scrape triggered via API');
        const result = await scraperService.scrapeAndSave();

        return NextResponse.json({
            success: result.success,
            data: {
                count: result.count,
                message: result.message,
            },
        });
    } catch (error) {
        console.error('Error during scrape:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to scrape pharmacies',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function POST() {
    return handleScrape();
}

export async function GET() {
    return handleScrape();
}
