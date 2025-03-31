import { Router } from 'express';
import EnvioController from '../../controllers/envio/envio.controller';
import ValidacionMiddleware from '../../middleware/schemas/validacion.middleware';
import AuthMiddleware from '../../middleware/auth/auth.middleware';

const router = Router();

// Crear un nuevo envío
router.post('/', 
  AuthMiddleware.validarJWT, 
  AuthMiddleware.verificarRol(['admin', 'user']), 
  ValidacionMiddleware.validarEnvio, 
  EnvioController.crearEnvio
);

// Obtener un envío por ID
router.get('/:id', 
  AuthMiddleware.validarJWT,
  AuthMiddleware.verificarRol(['admin', 'user']),
  EnvioController.obtenerEnvioPorId);

// Obtener envíos por vehículo y estado
router.get('/vehiculo/:vehiculoId/:estado', 
  AuthMiddleware.validarJWT,
  AuthMiddleware.verificarRol(['admin', 'user']),
  EnvioController.obtenerEnviosPorVehiculo);

// Actualizar el estado de un envío
router.patch('/:id/estado', 
  AuthMiddleware.validarJWT,
  AuthMiddleware.verificarRol(['admin']),
  EnvioController.actualizarEstadoEnvio);

router.post('/:id/asignar', 
  AuthMiddleware.validarJWT, 
  AuthMiddleware.verificarRol(['admin']), 
  EnvioController.asignarRutaYTransportista
)

export default router;