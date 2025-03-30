import Database from '../config/database';
import logger from '../services/logger/loggerService';

class VehiculoRepository {
  async obtenerVehiculoDisponible(totalPeso: number, totalVolumen: number, ciudadOrigen: string): Promise<any> {
    logger.info(`VehiculoRepository:obtenerVehiculoDisponible - Inicio`)
    const sql = `
      SELECT * FROM vehiculos
      WHERE estado = 'Disponible'
        AND kg_disponible >= ?
        AND volumen_disponible_m3 >= ?
        AND ciudad = ?
      LIMIT 1
    `;
    logger.debug(`VehiculoRepository:obtenerVehiculoDisponible - Parametros para consulta: ${JSON.stringify([totalPeso, totalVolumen, ciudadOrigen])}`)
    const resultados = await Database.query(sql, [totalPeso, totalVolumen, ciudadOrigen]);
    logger.debug(`VehiculoRepository:obtenerVehiculoDisponible - resultado consulta: ${resultados}`)
    logger.info(`VehiculoRepository:obtenerVehiculoDisponible - Fin`)
    return resultados.length > 0 ? resultados[0] : null;
  }

  async actualizarCapacidad(vehiculoId: number, pesoAsignado: number, volumenAsignado: number): Promise<void> {
    logger.info(`VehiculoRepository:actualizarCapacidad - Inicio`)
    const sql = `
      UPDATE vehiculos
      SET kg_disponible = kg_disponible - ?,
          volumen_disponible_m3 = volumen_disponible_m3 - ?
      WHERE id = ?
    `;
    logger.debug(`VehiculoRepository:actualizarCapacidad - Parametros para consulta: ${JSON.stringify([pesoAsignado, volumenAsignado, vehiculoId])}`)
    await Database.query(sql, [pesoAsignado, volumenAsignado, vehiculoId]);
    logger.info(`VehiculoRepository:actualizarCapacidad - Fin`)
  }

  async actualizarEstado(vehiculoId: number, estado: string): Promise<void> {
    logger.info(`VehiculoRepository:actualizarEstado - Inicio`)
    const sql = `UPDATE vehiculos SET estado = ? WHERE id = ?`;
    logger.debug(`VehiculoRepository:actualizarEstado - Parametros para consulta: ${JSON.stringify([estado, vehiculoId])}`)
    await Database.query(sql, [estado, vehiculoId]);
    logger.info(`VehiculoRepository:actualizarEstado - Fin`)
  }
}

export default new VehiculoRepository();