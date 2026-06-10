import cron from 'node-cron';
import { processReminders } from '../services/reminderService';
import { config } from '../config';

export function startReminderJob(logger: { info: (obj: object, msg: string) => void }) {
  cron.schedule(config.REMINDER_CRON, async () => {
    try {
      const count = await processReminders();
      logger.info({ count }, 'Reminder job completed');
    } catch (err) {
      logger.info({ err }, 'Reminder job failed');
    }
  });
}
