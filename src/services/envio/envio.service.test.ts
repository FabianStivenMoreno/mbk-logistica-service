import EnvioService from '../../services/envio/envio.service';
import EnvioRepository from '../../repositories/envio/envio.repository';
import UsuarioRepository from '../../repositories/usuario/usuario.repository';
import TransportistaRepository from '../../repositories/transportista/transportista.repository';
import VehiculoRepository from '../../repositories/vehiculo/vehiculo.repository';
import PaqueteRepository from '../../repositories/paquete/paquete.repository';
import CiudadRepository from '../../repositories/ciudad/ciudad.repository';
import { validarDireccionConGeocoder } from '../../utils/validaciones/validarDireccionConGeocoder';
import { guardarEstadoEnRedis } from '../../utils/cache/redisClient';
import { enviarNotificacionEmail } from '../../utils/notificacion/notificacionEmail';

jest.mock('../../repositories/envio/envio.repository', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findByIdWithPaquete: jest.fn(),
  actualizarEstadoEnvio: jest.fn(),
  actualizar: jest.fn(),
}));

jest.mock('../../repositories/paquete/paquete.repository', () => ({
  create: jest.fn(),
}));

jest.mock('../../repositories/usuario/usuario.repository', () => ({
  findCorreoById: jest.fn(),
}));

jest.mock('../../repositories/ciudad/ciudad.repository', () => ({
  obtenerCiudadYPaisPorId: jest.fn(),
}));

jest.mock('../../repositories/transportista/transportista.repository', () => ({
  estaDisponible: jest.fn(),
  actualizarEstado: jest.fn(),
}));

jest.mock('../../repositories/vehiculo/vehiculo.repository', () => ({
  obtenerCapacidad: jest.fn(),
  actualizarCapacidad: jest.fn(),
  actualizarEstado: jest.fn(),
}));

jest.mock('../../utils/validaciones/validarDireccionConGeocoder', () => ({
  validarDireccionConGeocoder: jest.fn(),
}));

jest.mock('../../utils/cache/redisClient', () => ({
  guardarEstadoEnRedis: jest.fn(),
}));

jest.mock('../../utils/notificacion/notificacionEmail', () => ({
  enviarNotificacionEmail: jest.fn(),
}));

describe('Pruebas del EnvioService', () => {
  describe('crearEnvio', () => {
    test('Debe crear un envío correctamente', async () => {
      const envioData = {
        envio: {
          usuario_id: 1,
          origen_ciudad_id: 1,
          destino_ciudad_id: 2,
          destino: {
            calle: 'Calle 50',
            carrera: 'Carrera 20',
            complemento: 'Apto 101',
          },
        },
        paquete: {
          peso_lb: 5,
          alto_cm: 30,
          ancho_cm: 50,
          profundidad_cm: 30,
          tipo_producto: 'Electrónicos',
          es_delicado: true,
        },
      };

      (CiudadRepository.obtenerCiudadYPaisPorId as jest.Mock).mockResolvedValue({ nombre: 'Bogotá', pais: 'Colombia' });
      (validarDireccionConGeocoder as jest.Mock).mockResolvedValue(true);
      (EnvioRepository.create as jest.Mock).mockResolvedValue({ insertId: 1 });
      (PaqueteRepository.create as jest.Mock).mockResolvedValue({});
      (EnvioRepository.findByIdWithPaquete as jest.Mock).mockResolvedValue({ id: 1, estado_actual: 'En espera' });
      (guardarEstadoEnRedis as jest.Mock).mockResolvedValue(undefined);

      const result = await EnvioService.crearEnvio(envioData);

      expect(result).toEqual({ id: 1, estado_actual: 'En espera' });
      expect(CiudadRepository.obtenerCiudadYPaisPorId).toHaveBeenCalledWith(2);
      expect(validarDireccionConGeocoder).toHaveBeenCalled();
      expect(EnvioRepository.create).toHaveBeenCalledWith(envioData.envio);
      expect(PaqueteRepository.create).toHaveBeenCalledWith({ ...envioData.paquete, envio_id: 1 });
      expect(guardarEstadoEnRedis).toHaveBeenCalledWith(1, JSON.stringify({ id: 1, estado_actual: 'En espera' }));
    });

    test('Debe arrojar un error si la dirección de destino no es válida', async () => {
      const envioData = {
        envio: {
          usuario_id: 1,
          origen_ciudad_id: 1,
          destino_ciudad_id: 2,
          destino: {
            calle: 'Calle 50',
            carrera: 'Carrera 20',
            complemento: 'Apto 101',
          },
        },
        paquete: {
          peso_lb: 5,
          alto_cm: 30,
          ancho_cm: 50,
          profundidad_cm: 30,
          tipo_producto: 'Electrónicos',
          es_delicado: true,
        },
      };

      (CiudadRepository.obtenerCiudadYPaisPorId as jest.Mock).mockResolvedValue({ nombre: 'Bogotá', pais: 'Colombia' });
      (validarDireccionConGeocoder as jest.Mock).mockResolvedValue(false);

      await expect(EnvioService.crearEnvio(envioData)).rejects.toThrow('La dirección de destino no es válida');
    });

    test('Debe arrojar un error si los datos del envío son incompletos', async () => {
      const envioData = { envio: {}, paquete: {} };
      await expect(EnvioService.crearEnvio(envioData)).rejects.toThrow('Datos incompletos para crear el envío');
    });
  });

  describe('actualizarEstadoEnvio', () => {
    test('Debe actualizar el estado del envío correctamente', async () => {
      const envioMock = { id: 1, usuario_id: 1 };
      const correoMock = 'usuario@test.com';

      (EnvioRepository.findById as jest.Mock).mockResolvedValue(envioMock);
      (UsuarioRepository.findCorreoById as jest.Mock).mockResolvedValue(correoMock);
      (guardarEstadoEnRedis as jest.Mock).mockResolvedValue(undefined);

      await EnvioService.actualizarEstadoEnvio(1, 'Entregado', new Date());

      expect(EnvioRepository.findById).toHaveBeenCalledWith(1);
      expect(UsuarioRepository.findCorreoById).toHaveBeenCalledWith(1);
      expect(guardarEstadoEnRedis).toHaveBeenCalled();
    });

    test('Debe arrojar un error si el envío no existe', async () => {
      (EnvioRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(EnvioService.actualizarEstadoEnvio(1, 'Entregado')).rejects.toThrow('El envío no existe');
    });
  });
});