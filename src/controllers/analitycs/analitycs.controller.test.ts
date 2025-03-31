import { Request, Response } from 'express';
import AnalitycsController from '../../controllers/analitycs/analitycs.controller';
import AnalitycsService from '../../services/analitycs/analitycs.service';

jest.mock('../../services/analitycs/analitycs.service');

describe('Pruebas del AnalitycsController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = {};
    mockResponse = {
      status: statusMock,
    };
    jest.clearAllMocks(); // Limpiar mocks antes de cada prueba
  });

  describe('obtenerDatosAnaliticos', () => {
    test('Debe retornar datos analíticos correctamente', async () => {
      const mockResultados = {
        totalEnvios: 10,
        metricas: {
          tiempoPromedioEntrega: '5.5 horas',
        },
        datosParaGraficos: {
          enviosPorFecha: {
            '2025-03-30': 3,
          },
        },
      };

      (AnalitycsService.obtenerDatosAnaliticos as jest.Mock).mockResolvedValue(mockResultados);

      mockRequest.query = { estado: 'En tránsito' };

      await AnalitycsController.obtenerDatosAnaliticos(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(AnalitycsService.obtenerDatosAnaliticos).toHaveBeenCalledWith(mockRequest.query);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockResultados);
    });

    test('Debe retornar un error si ocurre una excepción', async () => {
      const mockError = new Error('Error inesperado');

      (AnalitycsService.obtenerDatosAnaliticos as jest.Mock).mockRejectedValue(mockError);

      mockRequest.query = { estado: 'Entregado' };

      await AnalitycsController.obtenerDatosAnaliticos(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(AnalitycsService.obtenerDatosAnaliticos).toHaveBeenCalledWith(mockRequest.query);
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        mensaje: 'Error al obtener datos analíticos',
        error: mockError.message,
      });
    });
  });
});