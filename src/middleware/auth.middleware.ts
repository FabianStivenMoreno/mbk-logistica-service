import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import logger from '../services/logger/loggerService';

dotenv.config();

class AuthMiddleware {
  async validarJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info(`AuthMiddleware:validarJWT - Inicio`)
    try {
      const authHeader = req.headers['authorization'];
      logger.debug(`AuthMiddleware:validarJWT - data header request: ${authHeader}`)
      if (!authHeader) {
        logger.error(`AuthMiddleware:validarJWT - Error no viene con header authorization`)
        res.status(401).json({ mensaje: 'Token no proporcionado' });
        return;
      }
      const token = authHeader.split(' ')[1];
      if (!token) {
        logger.error(`AuthMiddleware:validarJWT - Error no viene con token`)
        res.status(401).json({ mensaje: 'Token no proporcionado' });
        return;
      }
      logger.debug(`AuthMiddleware:validarJWT - Token a validar: ${token}`)
      const urlRequest = `${process.env.AUTH_SERVICE_URL}/validar`
      logger.info(`AuthMiddleware:validarJWT - Url servicio (mbk-auth-service): ${urlRequest}`)
      const authResponse: any = await axios.get(urlRequest, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logger.debug(`AuthMiddleware:validarJWT - response llamado (mbk-auth-service): ${JSON.stringify(authResponse.data)}`)
      const { valid, user } = authResponse.data;
      logger.debug(`AuthMiddleware:validarJWT - data user: ${JSON.stringify(user)}`)
      logger.debug(`AuthMiddleware:validarJWT - data valid: ${valid}`)
      if (!valid) {
        logger.error(`AuthMiddleware:validarJWT - Respuesta correcta servicio - token invalido o expirado`)
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
        return;
      }
      (req as any).user = user;
      logger.info(`AuthMiddleware:validarJWT - Fin`)
      next();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        logger.error(`AuthMiddleware:validarJWT - Error 403 en servicio (mbk-auth-service): token inválido o expirado`)
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
        return;
      }
      logger.error(`AuthMiddleware:validarJWT - Error Interno en la validación: ${error}`)
      res.status(500).json({ mensaje: 'Error interno en la validación del token' });
    }
  }
  
  verificarRol(rolesPermitidos: string[]) {
    logger.info(`AuthMiddleware:verificarRol - Inicio`)
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      logger.debug(`AuthMiddleware:verificarRol - data user: ${JSON.stringify(user)}`)
      if (!user) {
        logger.error(`AuthMiddleware:verificarRol - Error usuario no autenticado`)
        res.status(401).json({ mensaje: 'Usuario no autenticado' });
        return;
      }
      if (!rolesPermitidos.includes(user.role)) {
        logger.error(`AuthMiddleware:verificarRol - Error usuario con permisos insuficientes`)
        res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado' });
        return;
      }
      logger.info(`AuthMiddleware:verificarRol - Fin`)
      next();
    }
  }
}

export default new AuthMiddleware();