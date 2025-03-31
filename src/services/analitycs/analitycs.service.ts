import AnalitycsRepository from '../../repositories/analitycs/analitycs.repository';

class AnalitycsService {
  async obtenerDatosAnaliticos(filtros: any): Promise<any> {
    // 1. Consultar envíos filtrados
    const envios = await AnalitycsRepository.consultarEnvios(filtros);

    // 2. Calcular métricas agregadas
    const metricas = {
      totalEnvios: envios.length,
      totalPorEstado: this.calcularTotalesPorEstado(envios),
      tiempoPromedioEntrega: this.calcularTiempoPromedio(envios),
    };

    // 3. Generar datos listos para gráficos
    const datosParaGraficos = {
      enviosPorFecha: this.agruparEnviosPorFecha(envios),
      enviosPorTransportista: this.agruparEnviosPorTransportista(envios),
    };

    return { envios, metricas, datosParaGraficos };
  }

  private calcularTotalesPorEstado(envios: any[]): Record<string, number> {
    return envios.reduce((totales, envio) => {
      const estado = envio.estado_actual || 'Desconocido';
      totales[estado] = (totales[estado] || 0) + 1;
      return totales;
    }, {});
  }

  private calcularTiempoPromedio(envios: any[]): string {
    const entregados = envios.filter(envio => envio.estado_actual === 'Entregado' && envio.fecha_entrega);
    if (!entregados.length) return '0 horas';

    const totalHoras = entregados.reduce((sum, envio) => {
      const inicio = new Date(envio.fecha_inicio).getTime();
      const entrega = new Date(envio.fecha_entrega).getTime();
      return sum + (entrega - inicio) / (1000 * 60 * 60); // Convertir a horas
    }, 0);

    return `${(totalHoras / entregados.length).toFixed(2)} horas`;
  }

  private agruparEnviosPorFecha(envios: any[]): Record<string, number> {
    return envios.reduce((grupos, envio) => {
      const fecha = new Date(envio.fecha_inicio).toISOString().split('T')[0];
      grupos[fecha] = (grupos[fecha] || 0) + 1;
      return grupos;
    }, {});
  }

  private agruparEnviosPorTransportista(envios: any[]): Record<string, number> {
    return envios.reduce((grupos, envio) => {
      const transportista = envio.transportista || 'Desconocido';
      grupos[transportista] = (grupos[transportista] || 0) + 1;
      return grupos;
    }, {});
  }
}

export default new AnalitycsService();