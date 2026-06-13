import { startBot } from './bot/telegram';
import { startDashboard } from './dashboard';

console.log('Starting X-Post-Agent Service...');
startBot();
void startDashboard().catch((error) => {
  console.error('Dashboard failed to start:', error);
});
