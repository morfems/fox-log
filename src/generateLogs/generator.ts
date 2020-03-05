import { sample, concat, times } from 'lodash';
import format from 'moment';
import path from 'path';
import { IConfig } from 'node-config-ts';
import { Logger } from "@tsed/logger";


export default class Generator {
    private readonly USER_NAMES: string[] = ['james', 'jill', 'frank', 'mary', 'Mouad'];
    private readonly HTTP_METHODS: string[] = ['GET', 'POST', 'PATCH', 'DELETE'];
    private readonly SECTIONS: string[] = ['/report', '/api/user', '/api/user', '/report/user', '/tata', '/titi'];
    private readonly SUCCESS_STATUS_CODES: number[] = [200, 201, 202, 203, 204];
    private readonly ERROR_STATUS_CODES: number[] = [500, 501, 502, 503, 504];
    private readonly REQUESTS_PER_SECONDS: number[] = [8, 10, 12];
    private logFilePath: string;

    constructor(private config: IConfig, private fs, private dirname: string, private logger: Logger) {
        this.logFilePath = this.config.logFilePath;
    }

    generateRandomLogLines(): void {
        setInterval(() => this._generateAndWriteLinesToLogFile(), 1000);
    }

    private _generateAndWriteLinesToLogFile(): void {
        const requestsPerSecond: number = sample(this.REQUESTS_PER_SECONDS);
        const generatedLines: string = this._getGeneratedLines(requestsPerSecond);

        Promise.resolve()
            .then(() => this._writeLinesToLogFile(generatedLines))
            .catch((err) => { console.log(err); this.logger.error(err) });
    }

    private _writeLinesToLogFile(lines: string): Promise<void> {
        const absoluteFilePath: string = path.resolve(this.dirname, this.logFilePath);
        return this.fs.appendFile(absoluteFilePath, lines, { flag: 'a' });
    }

    private _getGeneratedLines(nTimes: number): string {
        return times(nTimes, () => this._getGeneratedLine())
            .join('');
    }

    private _getGeneratedLine(): string {
        const userName: string = sample(this.USER_NAMES);
        const dateTime: string = format(new Date()).format('DD/MMM/YYYY:HH:mm:ss')
        const httpMethod: string = sample(this.HTTP_METHODS);
        const section: string = sample(this.SECTIONS);
        const status: number = sample(concat(this.SUCCESS_STATUS_CODES, this.ERROR_STATUS_CODES));

        return `127.0.0.1 - ${userName} [${dateTime} + 0000] "${httpMethod} ${section} HTTP/1.0" ${status} 123\n`;
    }
}
