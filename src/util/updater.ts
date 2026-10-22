import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export async function checkForZennithUpdates() {
  try {
    const update = await check({
      headers: {
        Authorization: 'Bearer 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'
      }
    });

    if (update?.available) {
      console.log(`Update available: ${update.version}`);
      await update.downloadAndInstall();
      await relaunch();
    } else {
      console.log('Zennith is up to date.');
    }
  } catch (error) {
    console.error('Failed to check for updates:', error);
  }
}