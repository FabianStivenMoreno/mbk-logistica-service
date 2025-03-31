import { Router } from 'express';
import AnalitycsController from '../../controllers/analitycs/analitycs.controller';
import AuthMiddleware from '../../middleware/auth/auth.middleware';

const router = Router();

router.get('/analitica', 
    AuthMiddleware.validarJWT,
    AuthMiddleware.verificarRol(['admin', 'user']), 
    AnalitycsController.obtenerDatosAnaliticos);

export default router;