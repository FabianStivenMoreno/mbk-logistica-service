import logger from "../../services/logger/loggerService";
import Database from "../../config/db/database";
class PaqueteRepository {
  async create(paqueteData: any): Promise<void> {
      logger.info(`PaqueteRepository:create - Inicio`);

      const sql = `
        INSERT INTO paquetes 
          (peso_lb, alto_cm, ancho_cm, profundidad_cm, tipo_producto, es_delicado, envio_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
          paqueteData.peso_lb,
          paqueteData.alto_cm,
          paqueteData.ancho_cm,
          paqueteData.profundidad_cm,
          paqueteData.tipo_producto,
          paqueteData.es_delicado,
          paqueteData.envio_id
      ];

      logger.debug(`PaqueteRepository:create - params: ${JSON.stringify(params)}`);
      await Database.query(sql, params);
      logger.info(`PaqueteRepository:create - Fin`);
  }
}

export default new PaqueteRepository();