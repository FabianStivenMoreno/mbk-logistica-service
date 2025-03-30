// src/controllers/envio.controller.ts
import { Request, Response } from 'express';
import EnvioService from '../services/envio.service';
import logger from '../services/logger/loggerService';

class EnvioController {
  async registrar(req: Request, res: Response): Promise<void> {
    logger.info(`EnvioController:registrar - Inicio`)
    try {
      // Extraer los datos del request
      const { envio, paquetes } = req.body;
      
      logger.debug(`EnvioController:registrar - data envio: ${JSON.stringify(envio)}`)
      logger.debug(`EnvioController:registrar - data paquetes: ${JSON.stringify(paquetes)}`)

      const userAuth = (req as any).user;
      
      logger.debug(`EnvioController:registrar - data usuario autenticado: ${JSON.stringify(userAuth)}`)
      
      if (envio.usuario_id !== userAuth.id) {
        logger.error(`EnvioController:registrar - userAuth.id (${userAuth.id}) diferente a usuario en request (${envio.usuario_id}) `)
        res.status(403).json({
          mensaje: 'El usuario de la solicitud no coincide con el usuario autenticado'
        });
        return;
      }

      const resultado = await EnvioService.registrarEnvioConPaquetes(envio, paquetes);
      logger.info(`EnvioController:registrar - Fin`)
      res.status(201).json(resultado);
    } catch (error: any) {
      logger.error(`EnvioController:registrar - error catch: ${error}`)
      res.status(400).json({ mensaje: error.message, error });
    }
  }
  
  async obtener(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`EnvioController:obtener - Inicio`)
      const envioId = Number(req.params.id);
      logger.debug(`EnvioController:obtener - envioId: ${envioId}`)
      const resultado = await EnvioService.obtenerEnvioConPaquetes(envioId);
      logger.info(`EnvioController:obtener - Fin`)
      res.status(200).json(resultado);
    } catch (error: any) {
      logger.error(`EnvioController:registrar - error envio no encontrado: ${error.message}`)
      res.status(404).json({ mensaje: 'Envío no encontrado', error });
    }
  }
}

export default new EnvioController();