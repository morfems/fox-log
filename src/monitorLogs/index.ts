import { Tail } from 'tail';
import { Logger } from "@tsed/logger";
import { Config } from 'node-config-ts';
import Monitor from './monitor';

export default (logger: Logger, config: Config, fileTail: Tail): void => {

    const monitor = new Monitor(logger, config);
    monitor.processData();

    fileTail.on("line", (data: string) => {
        monitor.storeData(data);
    });

    fileTail.on("error", (error: Error) => {
        monitor.handleError(error);
    });
};
