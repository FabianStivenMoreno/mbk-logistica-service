import Database from '../../config/db/database';
import logger from '../../services/logger/loggerService';

class VehiculoRepository {
  async obtenerCapacidad(vehiculoId: number): Promise<any> {
    logger.info(`VehiculoRepository:obtenerCapacidad - Inicio`);
    const query = `
      SELECT capacidad_restante_volumen_m3, capacidad_restante_kg 
      FROM vehiculos 
      WHERE id = ?
    `;
    logger.debug(`VehiculoRepository:obtenerCapacidad - Data: ${vehiculoId}`)
    const result = await Database.query(query, [vehiculoId]);
    logger.debug(`VehiculoRepository:obtenerCapacidad - Data: ${JSON.stringify(result)}`)
    if (!result) {
      throw new Error(`Vehículo con ID ${vehiculoId} no encontrado`);
    }
    logger.info(`VehiculoRepository:obtenerCapacidad - Fin`);
    return result
  }
  
  async actualizarCapacidad(vehiculoId: number, capKg: number, capVol: number): Promise<any> {
    logger.info(`VehiculoRepository:actualizarCapacidad - Inicio`);
    const query = `
      UPDATE vehiculos
      SET capacidad_restante_kg = capacidad_restante_kg - ?,
      capacidad_restante_volumen_m3 = capacidad_restante_volumen_m3 - ?
      WHERE id = ?
    `;
    logger.debug(`VehiculoRepository:actualizarCapacidad - Data: ${vehiculoId}`)
    const result = await Database.query(query, [capKg, capVol, vehiculoId]);
    logger.debug(`VehiculoRepository:actualizarCapacidad - Data: ${JSON.stringify(result)}`)
    if (!result) {
      throw new Error(`Vehículo con ID ${vehiculoId} no actualizado`);
    }
    logger.info(`VehiculoRepository:actualizarCapacidad - Fin`);
    return result
  }

  async actualizarEstado(vehiculoId: number, estado: string): Promise<any> {
    logger.info(`VehiculoRepository:actualizarEstado - Inicio`);
    const query = `
      UPDATE vehiculos
      SET estado = ?
      WHERE id = ?
    `;
    logger.debug(`VehiculoRepository:actualizarEstado - Data: ${vehiculoId}`)
    const result = await Database.query(query, [estado, vehiculoId]);
    logger.debug(`VehiculoRepository:actualizarEstado - Data: ${JSON.stringify(result)}`)
    if (!result) {
      throw new Error(`Vehículo con ID ${vehiculoId} no actualizado`);
    }
    logger.info(`VehiculoRepository:actualizarEstado - Fin`);
    return result
  }
}

export default new VehiculoRepository();