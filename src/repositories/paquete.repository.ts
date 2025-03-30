import Database from '../config/database';
import logger from '../services/logger/loggerService';

class PaqueteRepository {
  async create(paquete: any): Promise<any> {
    logger.info(`PaqueteRepository:create - Inicio`)
    const sql = `
      INSERT INTO paquetes 
        (peso_lb, alto_cm, ancho_cm, profundidad_cm, tipo_producto, es_delicado, envio_id, ruta_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      paquete.peso_lb,
      paquete.alto_cm,
      paquete.ancho_cm,
      paquete.profundidad_cm,
      paquete.tipo_producto,
      paquete.es_delicado,
      paquete.envio_id,
      paquete.ruta_id || null,
    ];
    logger.debug(`PaqueteRepository:create - params para consulta: ${JSON.stringify(params)}`)
    const res = await Database.query(sql, params);
    logger.debug(`PaqueteRepository:create - response query: ${JSON.stringify(res)}`)
    logger.info(`PaqueteRepository:create - Fin`)
    return res;
  }

  async findByEnvioId(envioId: number): Promise<any[]> {
    logger.info(`PaqueteRepository:findByEnvioId - Inicio`)
    const sql = `SELECT * FROM paquetes WHERE envio_id = ?`;
    logger.debug(`PaqueteRepository:findByEnvioId - id para la consulta: ${envioId}`)
    const res = await Database.query(sql, [envioId]);
    logger.debug(`PaqueteRepository:findByEnvioId - response query: ${JSON.stringify(res)}`)
    logger.info(`PaqueteRepository:findByEnvioId - Fin`)
    return res 
  }
}

export default new PaqueteRepository();