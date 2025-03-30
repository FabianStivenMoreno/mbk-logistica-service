import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

class ValidacionMiddleware {
  validarEnvio(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
      envio: Joi.object({
        usuario_id: Joi.number().integer().required(),
        origen: Joi.object({
          pais: Joi.string().required(),
          ciudad: Joi.string().required(),
          calle: Joi.string().required(),
          carrera: Joi.string().required(),
          complemento: Joi.string().allow('', null),
          latitud: Joi.number().optional(),
          longitud: Joi.number().optional()
        }).required(),
        destino: Joi.object({
          pais: Joi.string().required(),
          ciudad: Joi.string().required(),
          calle: Joi.string().required(),
          carrera: Joi.string().required(),
          complemento: Joi.string().allow('', null),
          latitud: Joi.number().optional(),
          longitud: Joi.number().optional()
        }).required()
      }).required(),
      paquetes: Joi.array().items(
        Joi.object({
          peso: Joi.number().positive().required(),
          alto_metros: Joi.number().positive().required(),
          ancho_metros: Joi.number().positive().required(),
          profundidad_metros: Joi.number().positive().required(),
          tipo_producto: Joi.string().required()
        })
      ).min(1).required()
    });
    
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(400).json({
        mensaje: 'Datos inválidos en la solicitud',
        errores: error.details.map(err => ({ mensaje: err.message, campo: err.path.join('.') }))
      });
    } else {
      next();
    }
  }
}

export default new ValidacionMiddleware();