import Database from '../../config/db/database';
import logger from '../../services/logger/loggerService';

class TransportistaRepository {
  async estaDisponible(transportistaId: number): Promise<boolean> {
    logger.info(`TransportistaRepository:estaDisponible - Inicio`);
    const query = `
      SELECT estado 
      FROM transportistas 
      WHERE id = ? AND estado = 'Disponible'
    `;
    const result = await Database.query(query, [transportistaId]);
    logger.debug(`TransportistaRepository:estaDisponible - data response: ${JSON.stringify(result)}`);
    logger.info(`TransportistaRepository:estaDisponible - Fin`);
    return !!result.length; // Devuelve true si está disponible, false si no lo está
  }

  async actualizarEstado(estado:string, transportistaId: number): Promise<boolean> {
    logger.info(`TransportistaRepository:actualizarEstado - Inicio`);
    const query = `
      UPDATE transportistas
      SET estado = ?
      WHERE id = ?
    `;
    const result = await Database.query(query, [estado, transportistaId]);
    logger.debug(`TransportistaRepository:estaDisponible - data response: ${JSON.stringify(result)}`);
    logger.info(`TransportistaRepository:estaDisponible - Fin`);
    return !!result.length; // Devuelve true si está disponible, false si no lo está
  }
}

export default new TransportistaRepository();