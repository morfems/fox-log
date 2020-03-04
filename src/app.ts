import { config } from 'node-config-ts';
import { $log as logger } from "@tsed/logger";
import { Tail } from 'tail';
import monitorLogs from './monitorLogs';

logger.level = config.level;
logger.name = "LOG MONITOR";

try {
    const fileTail: Tail = new Tail('src/log/access.log');
    monitorLogs(logger, config, fileTail);
} catch (ex) {
    logger.error(ex.message);
}
