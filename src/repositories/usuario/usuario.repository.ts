import Database from '../../config/db/database';
import logger from '../../services/logger/loggerService';

class UsuarioRepository {

  async findCorreoById(idUsuario: number): Promise<any> {
    logger.info(`UsuarioRepository:findCorreoById - Inicio`)
    const sql = `SELECT correo FROM usuarios WHERE id = ?`;
    logger.debug(`UsuarioRepository:findCorreoById - id para la consulta: ${idUsuario}`)
    const res = await Database.query(sql, [idUsuario]);
    logger.debug(`UsuarioRepository:findCorreoById - response query: ${JSON.stringify(res)}`)
    logger.info(`UsuarioRepository:findCorreoById - Fin`)
    return res 
  }
}

export default new UsuarioRepository();