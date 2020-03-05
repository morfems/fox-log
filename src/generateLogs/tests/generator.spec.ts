import Generator from '../generator';

let fs, config, dirname, logger;

beforeAll(() => {
    jest.spyOn(global, 'setInterval').mockImplementation((fn, ms) => { return new Promise(fn) as any; });
});

beforeEach(() => {
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
});

it('should call function inside setInterval with 1000 delay between each call', async () => {
    // Given
    const generator = new Generator(config, fs, dirname, logger);

    // When
    await generator.generateRandomLogLines();

    // Then
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
});

it('should call fs.appendFile with the right parameters', async () => {
    // Given
    const generator = new Generator(config, fs, dirname, logger);
    const expectedLines: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n' +
        '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123\n';

    // When
    await generator.generateRandomLogLines();

    // Then
    expect(fs.appendFile).toHaveBeenCalledWith('C:\\git\\fox-log\\src\\log\\access.log', expectedLines, { flag: 'a' });
});
