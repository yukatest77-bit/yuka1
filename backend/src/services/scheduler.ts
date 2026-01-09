import * as cron from 'node-cron';
import scraperService from './scraper';

class SchedulerService {
  private cronJob: cron.ScheduledTask | null = null;

  start(): void {
    // Default: Run every day at midnight (00:00)
    const cronSchedule = process.env.SCRAPER_CRON_SCHEDULE || '0 0 * * *';

    console.log(`⏰ Starting scheduler with cron: ${cronSchedule}`);

    this.cronJob = cron.schedule(cronSchedule, async () => {
      console.log('🕐 Running scheduled scrape job...');
      try {
        const result = await scraperService.scrapeAndSave();
        if (result.success) {
          console.log(`✅ Scheduled scrape completed: ${result.message}`);
        } else {
          console.error(`❌ Scheduled scrape failed: ${result.message}`);
        }
      } catch (error) {
        console.error('❌ Error in scheduled scrape:', error);
      }
    });

    console.log('✅ Scheduler started successfully');
  }

  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏹️ Scheduler stopped');
    }
  }

  async runNow(): Promise<void> {
    console.log('▶️ Running scraper immediately...');
    try {
      const result = await scraperService.scrapeAndSave();
      if (result.success) {
        console.log(`✅ Immediate scrape completed: ${result.message}`);
      } else {
        console.error(`❌ Immediate scrape failed: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error in immediate scrape:', error);
    }
  }
}

const schedulerService = new SchedulerService();
export default schedulerService;
