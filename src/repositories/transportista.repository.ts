import Database from '../config/database';
import logger from '../services/logger/loggerService';

class TransportistaRepository {
  async obtenerTransportistaDisponible(ciudad: string): Promise<any> {
    logger.info(`TransportistaRepository:obtenerTransportistaDisponible - Inicio`)
    const sql = `
      SELECT * FROM transportistas
      WHERE estado = 'Disponible'
        AND ciudad = ?
      LIMIT 1
    `;
    logger.debug(`TransportistaRepository:obtenerTransportistaDisponible para ciudad: ${ciudad} `)
    const resultados = await Database.query(sql, [ciudad]);
    logger.info(`TransportistaRepository:obtenerTransportistaDisponible - Fin`)
    return resultados.length > 0 ? resultados[0] : null;
  }

  async actualizarEstado(transportistaId: number, estado: string): Promise<void> {
    logger.info(`TransportistaRepository:actualizarEstado - Inicio`)
    const sql = `UPDATE transportistas SET estado = ? WHERE id = ?`;
    logger.debug(`TransportistaRepository:actualizarEstado - Parametros para consulta: ${JSON.stringify([estado, transportistaId])}`)
    await Database.query(sql, [estado, transportistaId]);
    logger.info(`TransportistaRepository:actualizarEstado - Fin`)
  }
}

export default new TransportistaRepository();