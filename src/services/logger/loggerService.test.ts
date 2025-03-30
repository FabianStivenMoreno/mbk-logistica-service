import logger from '../logger/loggerService';

describe('LoggerService', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockReturnValue(logger);
        jest.spyOn(logger, 'error').mockReturnValue(logger);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('Debería loggerse un log del nivel info', () => {
        logger.debug('Test info message');
        expect(logger.info).toHaveBeenCalledWith('Test info message');
    });

    test('Debería loggerse un log del nivel error', () => {
        logger.error('Test error message');
        expect(logger.error).toHaveBeenCalledWith('Test error message');
    });
});
