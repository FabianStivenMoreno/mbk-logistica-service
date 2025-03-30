import { Router } from 'express';
import EnvioController from '../controllers/envio.controller';
import AuthMiddleware from '../middleware/auth.middleware';
import ValidacionMiddleware from '../middleware/validacion.middleware';

const router = Router();

router.post(
  '/envios',
  AuthMiddleware.validarJWT,
  AuthMiddleware.verificarRol(['admin', 'user']),
  ValidacionMiddleware.validarEnvio,
  EnvioController.registrar
);

router.get(
  '/envios/:id',
  AuthMiddleware.validarJWT,
  AuthMiddleware.verificarRol(['admin', 'user']),
  EnvioController.obtener
);

export default router;