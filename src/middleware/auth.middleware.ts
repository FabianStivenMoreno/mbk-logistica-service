import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

class AuthMiddleware {
  async validarJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        res.status(401).json({ mensaje: 'Token no proporcionado' });
        return;
      }
      const token = authHeader.split(' ')[1];
      if (!token) {
        res.status(401).json({ mensaje: 'Token no proporcionado' });
        return;
      }
      const authResponse: any = await axios.get(`${process.env.AUTH_SERVICE_URL}/validar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { valid, user } = authResponse.data;
      if (!valid) {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
        return;
      }
      (req as any).user = user;
      next();
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        res.status(403).json({ mensaje: 'Token inválido o expirado' });
        return;
      }
      res.status(500).json({ mensaje: 'Error interno en la validación del token' });
    }
  }
  
  verificarRol(rolesPermitidos: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ mensaje: 'Usuario no autenticado' });
        return;
      }
      if (!rolesPermitidos.includes(user.role)) {
        res.status(403).json({ mensaje: 'Acceso denegado: rol no autorizado' });
        return;
      }
      next();
    }
  }
}

export default new AuthMiddleware();