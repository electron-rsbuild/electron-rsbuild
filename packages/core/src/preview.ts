import colors from 'picocolors';
import { createLogger } from 'rslog';
import type { InlineConfig } from './config';
import { startElectron } from './electron';
import { build } from './build';

export async function preview(inlineConfig: InlineConfig = {}, options: { skipBuild?: boolean }): Promise<void> {
  if (!options.skipBuild) {
    await build(inlineConfig);
  }

  const logger = createLogger({ level: inlineConfig.logLevel });

  startElectron(inlineConfig.root, 3);

  logger.info(colors.green(`\nstart electron app...\n`));
}
