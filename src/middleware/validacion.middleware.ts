import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import logger from '../services/logger/loggerService';

class ValidacionMiddleware {
  validarEnvio(req: Request, res: Response, next: NextFunction): void {
    logger.info(`ValidacionMiddleware:validarEnvio - Inicio`)
    const schema = Joi.object({
      envio: Joi.object({
        usuario_id: Joi.number().integer().required(),
        origen: Joi.object({
          pais: Joi.string().required(),
          ciudad: Joi.string().required(),
        }).required(),
        destino: Joi.object({
          pais: Joi.string().required(),
          ciudad: Joi.string().required(),
          calle: Joi.string().required(),
          carrera: Joi.string().required(),
          complemento: Joi.string().required(),
          detalle: Joi.string().required(),
        }).required()
      }).required(),
      paquetes: Joi.array().items(
        Joi.object({
          peso_lb: Joi.number().positive().required(),
          alto_cm: Joi.number().positive().required(),
          ancho_cm: Joi.number().positive().required(),
          profundidad_cm: Joi.number().positive().required(),
          tipo_producto: Joi.string().required(),
          es_delicado: Joi.boolean().required().default(false)
        })
      ).min(1).required()
    });
    
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      logger.error(`ValidacionMiddleware:validarEnvio - Error en la validacion de data del request`)
      res.status(400).json({
        mensaje: 'Datos inválidos en la solicitud',
        errores: error.details.map(err => ({ mensaje: err.message, campo: err.path.join('.') }))
      });
    } else {
      logger.info(`ValidacionMiddleware:validarEnvio - Fin`)
      next();
    }
  }
}

export default new ValidacionMiddleware();