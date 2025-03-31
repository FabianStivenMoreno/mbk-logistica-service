import { Request, Response } from 'express';
import AnalitycsService from '../../services/analitycs/analitycs.service';

class AnalitycsController {
  async obtenerDatosAnaliticos(req: Request, res: Response): Promise<any> {
    try {
      const filtros = req.query;
      const resultados = await AnalitycsService.obtenerDatosAnaliticos(filtros);
      return res.status(200).json(resultados);
    } catch (error: any) {
      return res.status(500).json({ mensaje: 'Error al obtener datos analíticos', error: error.message });
    }
  }
}

export default new AnalitycsController();