import Generator from './generator';

let fs, config, dirname, logger;

beforeAll(() => {
    fs = {
        appendFile: jest.fn(() => { })
    };

    config = {
        logFilePath: '../log/access.log'
    };

    logger = {
        error: jest.fn(() => { })
    };

    dirname = 'C:/git/fox-log/src/log';

    jest.unmock('lodash');
    const lodash = require.requireActual('lodash');
    lodash.sample = jest.fn((array) => array[0]);

    jest.unmock('moment');
    const moment = require.requireActual('moment');
    moment.fn.format = jest.fn(() => '01/Mar/2020:22:17:19');

    jest.spyOn(Generator.prototype, 'writeLinesToLogFile');
    jest.spyOn(Generator.prototype, 'generateAndWriteLinesToLogFile');
});

it('should return the expected log line', () => {
    // Given
    const generator = new Generator(config, fs, dirname, logger);
    const expectResult: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n';

    // When
    const generatedLine: string = generator.getGeneratedLine();

    // Then
    expect(generatedLine).toEqual(expectResult);
});

it('should return the expected log lines', () => {
    // Given
    const generator = new Generator(config, fs, dirname, logger);
    const nTimes = 3;
    const expectResult: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n';

    // When
    const generatedLines: string = generator.getGeneratedLines(nTimes);

    // Then
    expect(generatedLines).toEqual(expectResult);
});

it('should call appendFile with the right parameters', async () => {
    // Given
    const generator = new Generator(config, fs, dirname, logger);
    const lines = 'lines';

    // When
    await generator.writeLinesToLogFile(lines);

    // Then
    expect(fs.appendFile).toHaveBeenCalledWith('C:\\git\\fox-log\\src\\log\\access.log', 'lines', { flag: 'a' });
});

describe('generateAndWriteLinesToLogFile', () => {
    beforeEach(() => {
        jest.spyOn(Generator.prototype, 'getGeneratedLines')
            .mockImplementationOnce(() => 'lines');
    });

    it('should call getGeneratedLines with the reight parameter', async () => {
        // Given
        const generator = new Generator(config, fs, dirname, logger);

        // When
        await generator.generateAndWriteLinesToLogFile();

        // Then
        expect(generator.getGeneratedLines).toHaveBeenCalledWith(8);
    });

    it('should call writeLinesToLogFile with the reight parameter', async () => {
        // Given
        const generator = new Generator(config, fs, dirname, logger);

        // When
        await generator.generateAndWriteLinesToLogFile();

        // Then
        expect(generator.writeLinesToLogFile).toHaveBeenCalledWith('lines');
    });

    it('should catch the error when there is one', async () => {
        // Given
        const expectedError = new Error('Something went terribly wrong');
        fs = {
            appendFile: jest.fn().mockReturnValueOnce(Promise.reject(expectedError))
        };
        const generator = new Generator(config, fs, dirname, logger);

        // When
        await generator.generateAndWriteLinesToLogFile();

        // Then
        expect(logger.error).toHaveBeenCalledWith(expectedError);
    });
});

it('should call generateAndWriteLinesToLogFile inside setInterval with 1000 delay between each call', async () => {
    // Given
    jest.useFakeTimers();
    const generator = new Generator(config, fs, dirname, logger);

    // When
    await generator.generateRandomLogLines();

    // Then
    expect(generator.generateAndWriteLinesToLogFile).toHaveBeenCalled();
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 1000);
});
