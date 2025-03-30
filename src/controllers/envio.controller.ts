// src/controllers/envio.controller.ts
import { Request, Response } from 'express';
import EnvioService from '../services/envio.service';

class EnvioController {
  async registrar(req: Request, res: Response): Promise<void> {
    try {
      // Extraer los datos del request
      const { envio, paquetes } = req.body;
      // Obtener el usuario autenticado (agregado por el middleware de JWT)
      const userAuth = (req as any).user;
      
      // Validar que el usuario_id del body coincida con el del token
      if (envio.usuario_id !== userAuth.id) {
        res.status(403).json({
          mensaje: 'El usuario de la solicitud no coincide con el usuario autenticado'
        });
        return;
      }
      
      const resultado = await EnvioService.registrarEnvioConPaquetes(envio, paquetes);
      res.status(201).json(resultado);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message, error });
    }
  }
  
  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const envioId = Number(req.params.id);
      const resultado = await EnvioService.obtenerEnvioConPaquetes(envioId);
      res.status(200).json(resultado);
    } catch (error: any) {
      res.status(404).json({ mensaje: 'Envío no encontrado', error });
    }
  }
}

export default new EnvioController();