import Database from '../config/database';
import logger from '../services/logger/loggerService';

class EnvioRepository {
  async create(envio: any): Promise<any> {
    logger.info(`EnvioRepository:create - Inicio`)
    const sql = `
      INSERT INTO envios 
        (estado_actual, usuario_id, vehiculo_id, origen_pais, origen_ciudad,
         destino_pais, destino_ciudad, destino_calle, destino_carrera, destino_complemento, destino_detalle, ruta_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      envio.estado_actual || 'En espera',
      envio.usuario_id,
      envio.vehiculo_id || null,
      envio.origen.pais,
      envio.origen.ciudad,
      envio.destino.pais,
      envio.destino.ciudad,
      envio.destino.calle,
      envio.destino.carrera,
      envio.destino.complemento,
      envio.destino.detalle || null,
      envio.ruta_id || null,
    ];
    logger.debug(`EnvioRepository:create - params para consulta: ${JSON.stringify(params)}`)
    const res = await Database.query(sql, params)
    logger.debug(`EnvioRepository:create - response query: ${JSON.stringify(res)}`)
    logger.info(`EnvioRepository:create - Fin`)
    return res;
  }

  async findById(envioId: number): Promise<any> {
    logger.info(`EnvioRepository:findById - Inicio`)
    const sql = `SELECT * FROM envios WHERE id = ?`;
    logger.debug(`EnvioRepository:findById - id a buscar: ${envioId}`)
    const resultados = await Database.query(sql, [envioId]);
    logger.info(`EnvioRepository:findById - Fin`)
    return resultados[0];
  }

  async actualizarEstadoEnviosPorVehiculo(vehiculoId: number): Promise<void> {
    logger.info(`EnvioRepository:actualizarEstadoEnviosPorVehiculo - Inicio`)
    const sql = `
      UPDATE envios 
      SET estado_actual = 'En tránsito'
      WHERE vehiculo_id = ? AND estado_actual = 'En espera'
    `;
    logger.debug(`EnvioRepository:actualizarEstadoEnviosPorVehiculo - idVehiculo: ${vehiculoId}`)
    await Database.query(sql, [vehiculoId]);
  }
}

export default new EnvioRepository();