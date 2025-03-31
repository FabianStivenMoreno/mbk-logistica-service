import Database from '../../config/db/database';

class AnalitycsRepository {
  async consultarEnvios(filtros: any): Promise<any> {
    const { estado, transportistaId, fechaInicio, fechaFin } = filtros;

    const query = `
      SELECT e.id, e.estado_actual, e.fecha_inicio, e.fecha_entrega,
             t.nombre AS transportista, v.matricula AS vehiculo
      FROM envios e
      LEFT JOIN transportistas t ON e.transportista_id = t.id
      LEFT JOIN vehiculos v ON e.vehiculo_id = v.id
      WHERE 1=1
      ${estado ? 'AND e.estado_actual = ?' : ''}
      ${transportistaId ? 'AND e.transportista_id = ?' : ''}
      ${fechaInicio && fechaFin ? 'AND e.fecha_inicio BETWEEN ? AND ?' : ''}
    `;

    const params = [];
    if (estado) params.push(estado);
    if (transportistaId) params.push(transportistaId);
    if (fechaInicio && fechaFin) params.push(fechaInicio, fechaFin);

    const resultados = await Database.query(query, params);
    return resultados;
  }
}

export default new AnalitycsRepository();