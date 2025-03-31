import Database from '../../config/db/database';
import logger from '../../services/logger/loggerService';

class CiudadRepository {
  async obtenerCiudadYPaisPorId(ciudadId: number): Promise<any> {
    logger.info(`CiudadRepository:obtenerCiudadYPaisPorId - Inicio`)
    const sql = `
      SELECT * FROM ciudades
      WHERE id = ? 
      LIMIT 1
    `;
    logger.debug(`CiudadRepository:obtenerCiudadYPaisPorId para ciudad_id: ${ciudadId} `)
    const resultados = await Database.query(sql, [ciudadId]);
    logger.debug(`CiudadRepository:obtenerCiudadYPaisPorId  resultados: ${JSON.stringify(resultados)} `)
    logger.info(`CiudadRepository:obtenerCiudadYPaisPorId - Fin`)
    return resultados.length > 0 ? resultados[0] : null;
  }
}

export default new CiudadRepository();