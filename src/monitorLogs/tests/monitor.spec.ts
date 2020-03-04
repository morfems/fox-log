import { times } from 'lodash';
import Monitor from '../monitor';


let config, logger;

beforeEach(() => {
    jest.useFakeTimers();
    config = {
        numberOfMostVisitedSites: 2,
        threshold: 1
    };

    logger = {
        error: jest.fn(() => { }),
        info: jest.fn(() => { }),
        warn: jest.fn(() => { })
    };
});

afterEach(() => {
    jest.clearAllTimers();
});

it('should call function inside setInterval with 10 seconds delay between each call', () => {
    // Given
    const monitor = new Monitor(logger, config);

    // When
    monitor.processData();
    jest.advanceTimersByTime(10000);

    // Then
    expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 10000);
});

it('should log High traffic message when requests per senconds >= 1 in the tast 2 minutes', () => {
    // Given
    const monitor = new Monitor(logger, config);
    const data: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123';
    const secondExpectedResult: string = 'High traffic generated an alert - hits = 1';

    // When
    times(120, () => monitor.storeData(data));
    // monitor.storeData(anotherData);
    monitor.processData();
    jest.advanceTimersByTime(10000);

    // Then
    expect(logger.warn).toHaveBeenNthCalledWith(1, '***************************************');
    expect(logger.warn).toHaveBeenNthCalledWith(2, secondExpectedResult);
    expect(logger.warn).toHaveBeenNthCalledWith(3, '***************************************');
});

it('should not log High traffic message when requests per senconds <= 1 in the tast 2 minutes', () => {
    // Given
    const monitor = new Monitor(logger, config);
    const data: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123';

    // When
    times(119, () => monitor.storeData(data));
    monitor.processData();
    jest.advanceTimersByTime(10000);

    // Then
    expect(logger.warn).not.toHaveBeenCalled();
});

it('should log high traffic warning and then traffic back to normal', () => {
    // Given
    const monitor = new Monitor(logger, config);
    const data: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123';
    const anotherData: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /api HTTP/1.0" 200 123';
    const firstExpectedResult: string = 'High traffic generated an alert - hits = 1';
    const secondExpectedResult: string = 'Traffic is back to normal 🥳😺';

    // When
    times(120, () => monitor.storeData(data));
    monitor.processData();
    jest.advanceTimersByTime(10000);

    monitor.storeData(anotherData);
    jest.advanceTimersByTime(12 * 10000);


    // Then
    expect(logger.warn).toHaveBeenCalledWith(firstExpectedResult);
    expect(logger.info).toHaveBeenCalledWith(secondExpectedResult);
});

it('should log sections with the numbers of requests', () => {
    // Given
    const monitor = new Monitor(logger, config);
    const data: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /report HTTP/1.0" 200 123';
    const anotherData: string = '127.0.0.1 - james [01/Mar/2020:22:17:19 + 0000] "GET /api HTTP/1.0" 200 123';

    // When
    times(2, () => monitor.storeData(data));
    monitor.storeData(anotherData);
    monitor.processData();
    jest.advanceTimersByTime(10000);

    // Then
    expect(logger.info).toHaveBeenNthCalledWith(4, '<> report - 2 times');
    expect(logger.info).toHaveBeenNthCalledWith(5, '<> api - 1 times');
});

it('should call function inside setInterval with 10 seconds delay between each call', () => {
    // Given
    const monitor = new Monitor(logger, config);
    const error: Error = new Error('something wrong');

    // When
    monitor.handleError(error);

    // Then
    expect(logger.error).toHaveBeenCalledWith(error);
});

