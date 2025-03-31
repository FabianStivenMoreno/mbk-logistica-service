import Database from '../../config/db/database';
import logger from '../../services/logger/loggerService';
import { obtenerEstadoDesdeRedis } from '../../utils/cache/redisClient';


interface Envio {
  id?: number;
  estado_actual: string;
  usuario_id: number;
  vehiculo_id?: number;
  origen_ciudad_id: number;
  destino_ciudad_id: number;
  destino: {
    calle: string;
    carrera: string;
    complemento: string;
    detalle: string;
  };
  ruta_id?: number;
  transportista_id?: number;
  fecha_inicio: Date;
  fecha_ultima_actualizacion: Date;
  fecha_entrega?: Date;
  paquete: {
    peso_lb: number;
    alto_cm: number;
    ancho_cm: number;
    profundidad_cm: number;
    tipo_producto: string;
    es_delicado: boolean;
  };
}

class EnvioRepository {
  async create(envio: any): Promise<any> {
    logger.info(`EnvioRepository:create - Inicio`);

    const sql = `
      INSERT INTO envios 
        (estado_actual, usuario_id, vehiculo_id, origen_ciudad_id, 
        destino_ciudad_id, destino_calle, destino_carrera, destino_complemento, destino_detalle, ruta_id, 
        transportista_id, fecha_inicio, fecha_ultima_actualizacion, fecha_entrega, costo_envio, notificado_usuario) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    logger.debug(`EnvioRepository:create -  parametros para la insercion de datos en envios: ${JSON.stringify(envio)}`)
    let params
    if(envio.envio){
      params = [
        envio.envio.estado_actual || 'En espera',
        envio.envio.usuario_id,
        envio.envio.vehiculo_id || null,
        envio.envio.origen_ciudad_id,
        envio.envio.destino_ciudad_id,
        envio.envio.destino.calle,
        envio.envio.destino.carrera,
        envio.envio.destino.complemento || null,
        envio.envio.destino.detalle || null,
        envio.envio.ruta_id || null,
        envio.envio.transportista_id || null,
        envio.envio.fecha_inicio || new Date(),
        envio.envio.fecha_ultima_actualizacion || new Date(),
        envio.envio.fecha_entrega || null,
        envio.envio.costo_envio || 0.00,
        envio.envio.notificado_usuario || false,
      ];
    } else {
      params = [
        envio.estado_actual || 'En espera',
        envio.usuario_id,
        envio.vehiculo_id || null,
        envio.origen_ciudad_id,
        envio.destino_ciudad_id,
        envio.destino.calle,
        envio.destino.carrera,
        envio.destino.complemento || null,
        envio.destino.detalle || null,
        envio.ruta_id || null,
        envio.transportista_id || null,
        envio.fecha_inicio || new Date(),
        envio.fecha_ultima_actualizacion || new Date(),
        envio.fecha_entrega || null,
        envio.costo_envio || 0.00,
        envio.notificado_usuario || false,
      ];
    }
    

    logger.debug(`EnvioRepository:create - params para consulta: ${JSON.stringify(params)}`);
    const res = await Database.query(sql, params);
    logger.debug(`EnvioRepository:create - response query: ${JSON.stringify(res)}`);
    logger.info(`EnvioRepository:create - Fin`);
    return res;
  }


  async findById(envioId: number): Promise<Envio | null> {
    logger.info(`EnvioRepository:findById - Inicio`);
    // Verificar en Redis primero
    const cachedEnvio = await obtenerEstadoDesdeRedis(envioId);
    if (cachedEnvio) {
      logger.debug(`EnvioService:obtenerEnvioPorId - Datos encontrados en Redis: ${cachedEnvio}`);
      return JSON.parse(cachedEnvio); // Retornar datos desde Redis
    }

    const sql = `SELECT * FROM envios WHERE id = ?`;
    logger.debug(`EnvioRepository:findById - id a buscar en base de datos: ${Number(envioId)}`);
    const resultados = await Database.query(sql, [envioId]);
    logger.info(`EnvioRepository:findById - Fin`);
    return resultados.length ? resultados[0] : null;
  }

  async actualizarEstadoEnviosPorVehiculo(vehiculoId: number): Promise<void> {
    logger.info(`EnvioRepository:actualizarEstadoEnviosPorVehiculo - Inicio`);
    const sql = `
      UPDATE envios 
      SET estado_actual = 'En tránsito', fecha_ultima_actualizacion = ?
      WHERE vehiculo_id = ? AND estado_actual = 'En espera'
    `;
    logger.debug(`EnvioRepository:actualizarEstadoEnviosPorVehiculo - idVehiculo: ${vehiculoId}`);
    logger.info(`EnvioRepository:actualizarEstadoEnviosPorVehiculo - Fin`);
    await Database.query(sql, [new Date(), vehiculoId]);
  }

  async obtenerEnviosPorVehiculoYEstado(vehiculoId: number, estado: string): Promise<Envio[]> {
    logger.info(`EnvioRepository:obtenerEnviosPorVehiculoYEstado - Inicio`);
    const query = `
        SELECT * FROM envios 
        WHERE vehiculo_id = ? AND estado_actual = ?`;
    logger.debug(`EnvioRepository:obtenerEnviosPorVehiculoYEstado - idVehiculo: ${vehiculoId} - estado: ${estado}`);
    const result = await Database.query(query, [vehiculoId, estado]);
    logger.debug(`EnvioRepository:obtenerEnviosPorVehiculoYEstado - result consulta: ${JSON.stringify(result)}`);
    logger.info(`EnvioRepository:obtenerEnviosPorVehiculoYEstado - Fin`);
    return result;
  }

  async actualizarEstadoEnvio(envioId: number, estado: string, fechaEntrega?: Date): Promise<void> {
    logger.info(`EnvioRepository:actualizarEstadoEnvio - Inicio`);
    const query = `
        UPDATE envios 
        SET estado_actual = ?, fecha_ultima_actualizacion = ?, fecha_entrega = ?
        WHERE id = ?`;
    logger.debug(`EnvioRepository:actualizarEstadoEnvio - params consulta: ${JSON.stringify([estado, new Date(), fechaEntrega || null, envioId])}`);
    logger.info(`EnvioRepository:actualizarEstadoEnvio - Fin`);
    await Database.query(query, [estado, new Date(), fechaEntrega || null, envioId]);
  }

  async actualizar(envioId: number, datos: Partial<Envio>): Promise<void> {
    logger.info(`EnvioRepository:actualizar - Inicio`);
    const campos = Object.keys(datos).map(campo => `${campo} = ?`).join(', ');
    const valores = Object.values(datos);

    const query = `
      UPDATE envios 
      SET ${campos}, fecha_ultima_actualizacion = ?
      WHERE id = ?
    `;
    await Database.query(query, [...valores, new Date(), envioId]);
    logger.info(`EnvioRepository:actualizar - Fin`);
  }

  async findByIdWithPaquete(envioId: number): Promise<any> {
    logger.info(`EnvioRepository:findByIdWithPaquete - Inicio`);

    const sql = `
        SELECT e.*, 
               p.peso_lb, p.alto_cm, p.ancho_cm, p.profundidad_cm, 
               p.tipo_producto, p.es_delicado 
        FROM envios e
        LEFT JOIN paquetes p ON e.id = p.envio_id
        WHERE e.id = ?
    `;

    const result = await Database.query(sql, [envioId]);
    logger.debug(`EnvioRepository:findByIdWithPaquete - Result: ${JSON.stringify(result)}`);
    logger.info(`EnvioRepository:findByIdWithPaquete - Fin`);

    return result.length ? result[0] : null;
  }
}

export default new EnvioRepository();
