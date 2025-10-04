import colors from 'picocolors'
import {createLogger} from 'rslog'
import type {InlineConfig} from './config'
import {startElectron} from './electron'

export async function preview(inlineConfig: InlineConfig = {}): Promise<void> {
  const logger = createLogger({level: inlineConfig.logLevel})

  startElectron(inlineConfig.root)

  logger.info(colors.green('start electron app on preview...\n'))
}
