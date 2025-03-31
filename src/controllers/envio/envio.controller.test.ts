import { Request, Response } from 'express';
import EnvioController from '../../controllers/envio/envio.controller';
import EnvioService from '../../services/envio/envio.service';
import logger from '../../services/logger/loggerService';

jest.mock('../../services/envio/envio.service'); // Mock del servicio
jest.mock('../../services/logger/loggerService'); // Mock del logger

describe('Pruebas del EnvioController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    jest.clearAllMocks(); // Limpiar los mocks antes de cada prueba
  });

  describe('crearEnvio', () => {
    test('Debe crear un envío exitosamente', async () => {
      const mockEnvio = { id: 1, estado_actual: 'En tránsito' };
      (EnvioService.crearEnvio as jest.Mock).mockResolvedValue(mockEnvio);

      mockRequest.body = { usuario_id: 1, origen_ciudad_id: 2 };

      await EnvioController.crearEnvio(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.crearEnvio).toHaveBeenCalledWith(mockRequest.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Envío creado exitosamente',
        envio: mockEnvio,
      });
      expect(logger.info).toHaveBeenCalled();
    });

    test('Debe manejar un error al crear un envío', async () => {
      const mockError = new Error('Error al crear el envío');
      (EnvioService.crearEnvio as jest.Mock).mockRejectedValue(mockError);

      mockRequest.body = { usuario_id: 1, origen_ciudad_id: 2 };

      await EnvioController.crearEnvio(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.crearEnvio).toHaveBeenCalledWith(mockRequest.body);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Error al crear el envío',
        error: mockError.message,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('obtenerEnvioPorId', () => {
    test('Debe obtener un envío por ID exitosamente', async () => {
      const mockEnvio = { id: 1, estado_actual: 'En tránsito' };
      (EnvioService.obtenerEnvioPorId as jest.Mock).mockResolvedValue(mockEnvio);

      mockRequest.params = { id: '1' };

      await EnvioController.obtenerEnvioPorId(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.obtenerEnvioPorId).toHaveBeenCalledWith(1);
      expect(jsonMock).toHaveBeenCalledWith(mockEnvio);
      expect(logger.info).toHaveBeenCalled();
    });

    test('Debe manejar un envío no encontrado', async () => {
      (EnvioService.obtenerEnvioPorId as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '1' };

      await EnvioController.obtenerEnvioPorId(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.obtenerEnvioPorId).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: 'Envío no encontrado' });
      expect(logger.info).toHaveBeenCalled();
    });

    test('Debe manejar errores al obtener un envío por ID', async () => {
      const mockError = new Error('Error inesperado');
      (EnvioService.obtenerEnvioPorId as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await EnvioController.obtenerEnvioPorId(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.obtenerEnvioPorId).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Error al obtener el envío',
        error: mockError.message,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('actualizarEstadoEnvio', () => {
    test('Debe actualizar el estado de un envío exitosamente', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'Entregado', fecha_entrega: '2025-03-10' };

      await EnvioController.actualizarEstadoEnvio(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.actualizarEstadoEnvio).toHaveBeenCalledWith(1, 'Entregado', '2025-03-10');
      expect(jsonMock).toHaveBeenCalledWith({ mensaje: 'Estado del envío actualizado correctamente' });
      expect(logger.info).toHaveBeenCalled();
    });

    test('Debe manejar errores al actualizar el estado de un envío', async () => {
      const mockError = new Error('Error al actualizar el estado');
      (EnvioService.actualizarEstadoEnvio as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };
      mockRequest.body = { estado: 'Entregado', fecha_entrega: '2025-03-10' };

      await EnvioController.actualizarEstadoEnvio(mockRequest as Request, mockResponse as Response);

      expect(EnvioService.actualizarEstadoEnvio).toHaveBeenCalledWith(1, 'Entregado', '2025-03-10');
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Error al actualizar el estado del envío',
        error: mockError.message,
      });
      expect(logger.error).toHaveBeenCalled();
    });
  });
});