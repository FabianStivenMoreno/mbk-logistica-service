import EnvioRepository from '../../repositories/envio/envio.repository';
import UsuarioRepository from '../../repositories/usuario/usuario.repository';
import TransportistaRepository from '../../repositories/transportista/transportista.repository';
import VehiculoRepository from '../../repositories/vehiculo/vehiculo.repository';
import { guardarEstadoEnRedis } from '../../utils/cache/redisClient';
import { enviarNotificacionEmail } from '../../utils/notificacion/notificacionEmail';
import { validarDireccionConGeocoder } from '../../utils/validaciones/validarDireccionConGeocoder'
import logger from '../logger/loggerService';
import PaqueteRepository from '../../repositories/paquete/paquete.repository';
import CiudadRepository from '../../repositories/ciudad/ciudad.repository' 
class EnvioService {
  async crearEnvio(envioData: any) {
    logger.info(`EnvioService:crearEnvio - Inicio`);
    logger.debug(`EnvioService:crearEnvio - envioData: ${JSON.stringify(envioData)}`);

    // Validaciones de negocio
    if (!envioData.envio.usuario_id || !envioData.envio.origen_ciudad_id || !envioData.envio.destino_ciudad_id) {
      throw new Error('Datos incompletos para crear el envío');
    }

    // validación de dirección de destino correcta
    const dataRes = await CiudadRepository.obtenerCiudadYPaisPorId(Number(envioData.envio.destino_ciudad_id))
    const direccionDestino = envioData.envio ? `Calle ${envioData.envio.destino.calle} # ${envioData.envio.destino.carrera} - ${envioData.envio.destino.complemento}, ${dataRes.nombre}, ${dataRes.pais}` : `Calle ${envioData.destino.calle} # ${envioData.destino.carrera} - ${envioData.destino.complemento}, ${dataRes.nombre}, ${dataRes.pais}`;
    logger.debug(`EnvioService:crearEnvio - direccionDestino formateada: ${direccionDestino}`)

    // Validación destino valido
    const destinoValido = await validarDireccionConGeocoder(direccionDestino);
    if (!destinoValido) {
      logger.debug(`EnvioService:registrarEnvioConPaquetes - Error direccionDestino invalida`)
      throw new Error('La dirección de destino no es válida');
    }
    
    logger.debug(`EnvioService:crearEnvio - validacion de destino correcto`)

    envioData.envio.estado_actual = 'En espera';
    logger.debug(`EnvioService:crearEnvio - estadoActual: ${envioData.envio.estado_actual}`);
    envioData.envio.fecha_inicio = new Date();
    logger.debug(`EnvioService:crearEnvio - fecha_inicio: ${envioData.envio.fecha_inicio}`);
    envioData.envio.fecha_ultima_actualizacion = new Date();
    logger.debug(`EnvioService:crearEnvio - fecha_ultima_actualizacion: ${envioData.envio.fecha_ultima_actualizacion}`);

    // Crear el envío en la base de datos
    const envio = await EnvioRepository.create(envioData.envio);
    logger.info(`EnvioService:crearEnvio - Envío almacenado en base de datos correctamente`);
    const envioId = envio.insertId;

    // Validar datos del paquete
    if (!envioData.paquete) {
      throw new Error('Datos del paquete no proporcionados en el request');
    }

    // Crear el paquete en la base de datos
    const paqueteData = { ...envioData.paquete, envio_id: envioId }; // Relacionar el paquete con el envío
    await PaqueteRepository.create(paqueteData);
    logger.info(`EnvioService:crearEnvio - Paquete asociado al envío ID ${envioId} - paquete: ${JSON.stringify(paqueteData)}`);

    // Recuperar el envío completo con su paquete
    const envioCompleto = await EnvioRepository.findByIdWithPaquete(envioId); // Incluye datos del paquete
    if (!envioCompleto) {
      throw new Error('No se pudo recuperar el envío recién creado');
    }

    // Almacenar el envío completo en Redis
    await guardarEstadoEnRedis(envioId, JSON.stringify(envioCompleto));
    logger.info(`EnvioService:crearEnvio - Envío completo almacenado en Redis con ID ${envioId}`);

    return envioCompleto;
  }


  async asignarVehiculo(envioId: number, vehiculoId: number) {
    logger.info(`EnvioService:asignarVehiculo - Inicio`);
    const envio: any = await EnvioRepository.findById(envioId);
    if (!envio) {
      throw new Error('El envío no existe');
    }

    envio.vehiculo_id = vehiculoId;
    const actEstado = await EnvioRepository.actualizarEstadoEnvio(envioId, 'Asignado a vehículo', undefined);
    logger.debug(JSON.stringify(actEstado))

    // Recuperar el envío completo con su paquete
    const envioCompleto = await EnvioRepository.findByIdWithPaquete(envioId); 
    if (!envioCompleto) {
      throw new Error('EnvioService:asignarVehiculo - No se pudo recuperar el envío recién actualizado');
    }

    // Almacenar el envío completo en Redis
    await guardarEstadoEnRedis(envioId, JSON.stringify(envioCompleto));
    logger.info(`EnvioService:asignarVehiculo - Vehículo ${vehiculoId} asignado al envío ${envioId}`);
  }

  async actualizarEstadoEnvio(envioId: number, nuevoEstado: string, fechaEntrega?: Date) {
    logger.info(`EnvioService:actualizarEstadoEnvio - Inicio`);
    const envio = await EnvioRepository.findById(envioId);
    if (!envio) {
      throw new Error('El envío no existe');
    }

    await EnvioRepository.actualizarEstadoEnvio(envioId, nuevoEstado, fechaEntrega);
    // Recuperar el envío completo con su paquete
    const envioCompleto = await EnvioRepository.findByIdWithPaquete(envioId); // Incluye datos del paquete
    if (!envioCompleto) {
      throw new Error('No se pudo recuperar el envío recién creado');
    }

    // Almacenar el envío completo en Redis
    await guardarEstadoEnRedis(envioId, JSON.stringify({
      ...envioCompleto,
      estado_actual: nuevoEstado,
      fecha_entrega: fechaEntrega
    }));
    logger.info(`EnvioService:actualizarEstadoEnvio - Envío completo almacenado en Redis con ID ${envioId}`);

    const correoUsr = await UsuarioRepository.findCorreoById(envio.usuario_id)

    await enviarNotificacionEmail(correoUsr, 'Cambio de estado envío', `El estado de tu envío ha cambiado a: ${nuevoEstado}`);
    logger.info(`EnvioService:actualizarEstadoEnvio - Estado actualizado a ${nuevoEstado} para el envío ${envioId}`);
  }

  async obtenerEnvioPorId(envioId: number) {
    return await EnvioRepository.findById(Number(envioId));
  }

  async obtenerEnviosPorVehiculo(vehiculoId: number, estado: string) {
    return await EnvioRepository.obtenerEnviosPorVehiculoYEstado(vehiculoId, estado);
  }

  async asignarRutaYTransportista(envioId: number, rutaId: number, transportistaId: number, vehiculoId: number): Promise<void> {
    logger.info(`EnvioService:asignarRutaYTransportista - Inicio`);

    // Validar existencia del envío
    const envio: any = await EnvioRepository.findById(envioId);
    if (!envio) {
      throw new Error('El envío no existe');
    }

    // Validar disponibilidad del transportista
    const transportistaDisponible = await TransportistaRepository.estaDisponible(transportistaId);
    if (!transportistaDisponible) {
      throw new Error('El transportista no está disponible');
    }

    // Recuperar el envío completo con su paquete
    const envioCompleto = await EnvioRepository.findByIdWithPaquete(envioId);
    if (!envioCompleto) {
      throw new Error('No se pudo recuperar el envío recién creado');
    }

    logger.debug('EnvioService:asignarRutaYTransportista - EnvioCompleto: ' + JSON.stringify(envioCompleto))
    // Validar capacidad del vehículo
    const paqueteVolumenm3 = (envioCompleto.alto_cm * envioCompleto.ancho_cm * envioCompleto.profundidad_cm) / 1000000;
    const paquetePesoKg = (envioCompleto.peso_lb) /2.20462
    const vehiculoCapacidad = await VehiculoRepository.obtenerCapacidad(vehiculoId);

    if (paqueteVolumenm3 > vehiculoCapacidad.volumen_restante_m3 || paquetePesoKg  > vehiculoCapacidad.peso_restante_kg) {
      // Se actualiza el estado del vehiculo cuando ya no tiene capacidad de recibir mas paquetes
      VehiculoRepository.actualizarEstado(vehiculoId, 'Ocupado')
      throw new Error('El vehículo no tiene capacidad suficiente');
    }

    // Asignar ruta, transportista y vehículo al envío
    envio.ruta_id = rutaId;
    envio.transportista_id = transportistaId;
    envio.vehiculo_id = vehiculoId;

    await EnvioRepository.actualizar(envioId, {
      ruta_id: rutaId,
      transportista_id: transportistaId,
      vehiculo_id: vehiculoId,
      estado_actual: 'En tránsito',
    });

    // Actualizar estados y capacidad del vehiculo
    await TransportistaRepository.actualizarEstado('Ocupado', transportistaId)
    await VehiculoRepository.actualizarCapacidad(vehiculoId, paquetePesoKg, paqueteVolumenm3)
    logger.info(`EnvioService:asignarRutaYTransportista - Ruta y transportista asignados`);
  }

}

export default new EnvioService();
