import { Request, Response } from 'express';
import EnvioService from '../../services/envio/envio.service';
import logger from '../../services/logger/loggerService';

class EnvioController {
  async crearEnvio(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`EnvioController:crearEnvio - Inicio`);
      const envio = await EnvioService.crearEnvio(req.body);
      res.status(201).json({ mensaje: 'Envío creado exitosamente', envio });
      logger.info(`EnvioController:crearEnvio - Fin`);
    } catch (error: any) {
      logger.error(`EnvioController:crearEnvio - Error: ${error.message}`);
      res.status(500).json({ mensaje: 'Error al crear el envío', error: error.message });
    }
  }

  async obtenerEnvioPorId(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`EnvioController:obtenerEnvioPorId - Inicio`);
      const envio = await EnvioService.obtenerEnvioPorId(Number(req.params.id));
      if (!envio) {
        res.status(404).json({ mensaje: 'Envío no encontrado' });
        return;
      }
      res.json(envio);
      logger.info(`EnvioController:obtenerEnvioPorId - Fin`);
    } catch (error: any) {
      logger.error(`EnvioController:obtenerEnvioPorId - Error: ${error.message}`);
      res.status(500).json({ mensaje: 'Error al obtener el envío', error: error.message });
    }
  }

  async actualizarEstadoEnvio(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`EnvioController:actualizarEstadoEnvio - Inicio`);
      const { estado, fecha_entrega } = req.body;
      logger.debug(`EnvioController:actualizarEstadoEnvio - Request body: ${JSON.stringify({ estado, fecha_entrega })}`);
      await EnvioService.actualizarEstadoEnvio(Number(req.params.id), estado, fecha_entrega);
      logger.debug(`EnvioController:asignarRutaYTransportista - Request parms id: ${req.params.id}`);
      res.json({ mensaje: 'Estado del envío actualizado correctamente' });
      logger.info(`EnvioController:actualizarEstadoEnvio - Fin`);
    } catch (error: any) {
      logger.error(`EnvioController:actualizarEstadoEnvio - Error: ${error.message}`);
      res.status(500).json({ mensaje: 'Error al actualizar el estado del envío', error: error.message });
    }
  }

  async obtenerEnviosPorVehiculo(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`EnvioController:obtenerEnviosPorVehiculo - Inicio`);
      const envios = await EnvioService.obtenerEnviosPorVehiculo(Number(req.params.vehiculoId), req.query.estado as string);
      res.json(envios);
      logger.info(`EnvioController:obtenerEnviosPorVehiculo - Fin`);
    } catch (error: any) {
      logger.error(`EnvioController:obtenerEnviosPorVehiculo - Error: ${error.message}`);
      res.status(500).json({ mensaje: 'Error al obtener los envíos', error: error.message });
    }
  }

  async asignarRutaYTransportista(req: Request, res: Response): Promise<void> {
    try {
        logger.info(`EnvioController:asignarRutaYTransportista - Inicio`);
        
        const { rutaId, transportistaId, vehiculoId } = req.body;

        logger.debug(`EnvioController:asignarRutaYTransportista - Request body: ${JSON.stringify({rutaId, transportistaId, vehiculoId})}`);

        const envioId = Number(req.params.id);

        logger.debug(`EnvioController:asignarRutaYTransportista - Request parms id: ${envioId}`);

        await EnvioService.asignarRutaYTransportista(envioId, rutaId, transportistaId, vehiculoId);

        res.status(200).json({ mensaje: 'Ruta y transportista asignados correctamente' });

        logger.info(`EnvioController:asignarRutaYTransportista - Fin`);
    } catch (error: any) {
        logger.error(`EnvioController:asignarRutaYTransportista - Error: ${error.message}`);
        res.status(500).json({ mensaje: 'Error al asignar la ruta y el transportista', error: error.message });
    }
}

}

export default new EnvioController();
