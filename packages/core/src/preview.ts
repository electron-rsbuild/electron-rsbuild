import colors from 'picocolors';
import { createLogger } from 'rslog';
import type { InlineConfig } from './config';
import { startElectron } from './electron';
import { createBuild } from './build';

export async function preview(inlineConfig: InlineConfig = {}, options: { skipBuild?: boolean }): Promise<void> {
  if (!options.skipBuild) {
    await createBuild(inlineConfig);
  }

  const logger = createLogger({ level: inlineConfig.logLevel });

  startElectron(inlineConfig.root);

  logger.info(colors.green(`start electron app...\n`));
}
