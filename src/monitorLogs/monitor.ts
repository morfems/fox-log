import { chain, filter, size, take } from 'lodash';
import { Config } from 'node-config-ts';
import { Logger } from "@tsed/logger";

interface Statistic {
    section: string;
    count: number;
    numberOfErrors: number;
}

export default class Generator {
    private readonly ERROR_STATUS_CODES: number[] = [500, 501, 502, 503, 504];
    private readonly ROUTE_POSITION: number = 7;
    private readonly STATUS_CODE_POSITION: number = 9;
    private readonly SECONDS_IN_TWO_MINUTES: number = 120;
    private readonly WATCHES_IN_TWO_MINUTES: number = 12;
    private watches: number = 1; // 12 watches => 2 minutes
    private logsStorage: string[][] = [[], [], [], [], [], [], [], [], [], [], [], []];
    private statisticsHistoryStorage: Statistic[][] = [];
    private isTresholdHit = false;

    constructor(private logger: Logger, private config: Config) {
    }

    processData(): void {
        setInterval(() => this._monitorNewLogs(), 10000);
    }

    storeData(data: string): void {
        const storageIndex: number = this.watches - 1;
        this.logsStorage[storageIndex].push(data);
    }

    handleError(error: Error): void {
        this.logger.error(error);
    }

    private _monitorNewLogs(): void {
        const storageIndex: number = this.watches - 1;
        const lastWatchData: string[] = this.logsStorage[storageIndex];

        const statistics: Statistic[] = chain(lastWatchData)
            .map((data: string) => ({
                section: this._getSection(this._getFromPosition(data, this.ROUTE_POSITION)),
                isErrorStatusCode: this._isErrorStatusCode(this._getFromPosition(data, this.STATUS_CODE_POSITION))
            }))
            .groupBy('section')
            .map((items, section) => ({
                section: section,
                count: items.length,
                numberOfErrors: size(filter(items, 'isErrorStatusCode'))
            }))
            .orderBy('count', 'desc')
            .value();

        this._manageHistory(statistics);

        const requestsPerSecond: number = chain(this.statisticsHistoryStorage)
            .flatten()
            .sumBy('count')
            .divide(this.SECONDS_IN_TWO_MINUTES)
            .value();

        this._logStatistics(statistics, requestsPerSecond);
    }

    private _getSection(route: string): string {
        return route.split('/')[1];
    }

    private _isErrorStatusCode(statusCode: string): boolean {
        return this.ERROR_STATUS_CODES.includes(parseInt(statusCode));
    }

    private _getFromPosition(data: string, position: number): string {
        return data.split(' ')[position];
    }

    private _manageHistory(statistics: Statistic[]): void {
        if (this.watches < this.WATCHES_IN_TWO_MINUTES) {
            this.watches++;
        } else {
            this.logsStorage.shift();
            this.logsStorage.push([]);
        }

        if (this.statisticsHistoryStorage.length < this.WATCHES_IN_TWO_MINUTES) {
            this.statisticsHistoryStorage.push(statistics);
        } else {
            this.statisticsHistoryStorage.shift();
            this.statisticsHistoryStorage.push(statistics);
        }
    }

    private _logStatistics(statistics: Statistic[], requestsPerSecond: number): void {
        this.logger.info('***************************************');
        this.logger.info(`${this.config.numberOfMostVisitedSites} most visited sections :`);
        this.logger.info('***************************************');

        const mostVisitedSites = take(statistics, this.config.numberOfMostVisitedSites);

        mostVisitedSites.forEach((site) => this.logger.info(`<> ${site.section} - ${site.count} times`));

        this.logger.info('***************************************');
        this.logger.info('Nombres d\'erreurs par section :');
        this.logger.info('***************************************');

        statistics.forEach(({ section, numberOfErrors }: { section: string, numberOfErrors: number }) => {
            this.logger.info(`Section : ${section}, number of errors : ${numberOfErrors}`);
        });

        if (requestsPerSecond >= this.config.threshold) {
            this.isTresholdHit = true;
            this.logger.warn('***************************************');
            this.logger.warn(`High traffic generated an alert - hits = ${Math.floor(requestsPerSecond)}`);
            this.logger.warn('***************************************');
        } else if (this.isTresholdHit === true) {
            this.isTresholdHit = false;
            this.logger.info('***************************************');
            this.logger.info('Traffic is back to normal 🥳😺');
            this.logger.info('***************************************');
        }
    }

}
