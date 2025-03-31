import AnalitycsService from '../../services/analitycs/analitycs.service';
import AnalitycsRepository from '../../repositories/analitycs/analitycs.repository';

jest.mock('../../repositories/analitycs/analitycs.repository');

describe('Pruebas del AnalitycsService', () => {
  describe('obtenerDatosAnaliticos', () => {
    test('Debe retornar envíos, métricas y datos para gráficos correctamente', async () => {
      // Datos simulados
      const filtros = { estado: 'Entregado' };
      const mockEnvios = [
        { estado_actual: 'Entregado', fecha_inicio: '2025-03-30T10:00:00', fecha_entrega: '2025-03-30T15:00:00', transportista: 'Carlos' },
        { estado_actual: 'En tránsito', fecha_inicio: '2025-03-31T10:00:00', transportista: 'Ana' },
      ];

      (AnalitycsRepository.consultarEnvios as jest.Mock).mockResolvedValue(mockEnvios);

      const resultados = await AnalitycsService.obtenerDatosAnaliticos(filtros);

      expect(resultados.envios).toEqual(mockEnvios);
      expect(resultados.metricas).toEqual({
        totalEnvios: 2,
        totalPorEstado: { Entregado: 1, 'En tránsito': 1 },
        tiempoPromedioEntrega: '5.00 horas',
      });
      expect(resultados.datosParaGraficos).toEqual({
        enviosPorFecha: { '2025-03-30': 1, '2025-03-31': 1 },
        enviosPorTransportista: { Carlos: 1, Ana: 1 },
      });
    });

    test('Debe manejar un caso donde no haya envíos', async () => {
      const filtros = { estado: 'Entregado' };
      (AnalitycsRepository.consultarEnvios as jest.Mock).mockResolvedValue([]);

      const resultados = await AnalitycsService.obtenerDatosAnaliticos(filtros);

      expect(resultados.envios).toEqual([]);
      expect(resultados.metricas).toEqual({
        totalEnvios: 0,
        totalPorEstado: {},
        tiempoPromedioEntrega: '0 horas',
      });
      expect(resultados.datosParaGraficos).toEqual({
        enviosPorFecha: {},
        enviosPorTransportista: {},
      });
    });
  });

  describe('calcularTotalesPorEstado', () => {
    test('Debe calcular totales por estado correctamente', () => {
      const mockEnvios = [
        { estado_actual: 'Entregado' },
        { estado_actual: 'En tránsito' },
        { estado_actual: 'En tránsito' },
        { estado_actual: null }, // Estado desconocido
      ];

      const totales = (AnalitycsService as any).calcularTotalesPorEstado(mockEnvios);

      expect(totales).toEqual({ Entregado: 1, 'En tránsito': 2, Desconocido: 1 });
    });
  });

  describe('calcularTiempoPromedio', () => {
    test('Debe calcular el tiempo promedio de entrega correctamente', () => {
      const mockEnvios = [
        { estado_actual: 'Entregado', fecha_inicio: '2025-03-30T10:00:00', fecha_entrega: '2025-03-30T14:00:00' },
        { estado_actual: 'Entregado', fecha_inicio: '2025-03-31T09:00:00', fecha_entrega: '2025-03-31T12:00:00' },
      ];

      const tiempoPromedio = (AnalitycsService as any).calcularTiempoPromedio(mockEnvios);

      expect(tiempoPromedio).toBe('3.50 horas');
    });

    test('Debe devolver "0 horas" si no hay envíos entregados', () => {
      const mockEnvios = [
        { estado_actual: 'En tránsito', fecha_inicio: '2025-03-30T10:00:00' },
      ];

      const tiempoPromedio = (AnalitycsService as any).calcularTiempoPromedio(mockEnvios);

      expect(tiempoPromedio).toBe('0 horas');
    });
  });

  describe('agruparEnviosPorFecha', () => {
    test('Debe agrupar envíos por fecha correctamente', () => {
      const mockEnvios = [
        { fecha_inicio: '2025-03-30T10:00:00' },
        { fecha_inicio: '2025-03-30T11:00:00' },
        { fecha_inicio: '2025-03-31T10:00:00' },
      ];

      const agrupados = (AnalitycsService as any).agruparEnviosPorFecha(mockEnvios);

      expect(agrupados).toEqual({ '2025-03-30': 2, '2025-03-31': 1 });
    });
  });

  describe('agruparEnviosPorTransportista', () => {
    test('Debe agrupar envíos por transportista correctamente', () => {
      const mockEnvios = [
        { transportista: 'Carlos' },
        { transportista: 'Carlos' },
        { transportista: 'Ana' },
        { transportista: null }, // Transportista desconocido
      ];

      const agrupados = (AnalitycsService as any).agruparEnviosPorTransportista(mockEnvios);

      expect(agrupados).toEqual({ Carlos: 2, Ana: 1, Desconocido: 1 });
    });
  });
});