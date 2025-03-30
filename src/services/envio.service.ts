import EnvioRepository from '../repositories/envio.repository';
import PaqueteRepository from '../repositories/paquete.repository';
import VehiculoRepository from '../repositories/vehiculo.repository';
import TransportistaRepository from '../repositories/transportista.repository';
import { validarDireccionConGeocoder } from '../utils/validarDireccionConGeocoder';
import { enviarNotificacionEmail } from '../utils/notificacionEmail';
import Database from '../config/database';
import logger from './logger/loggerService';

class EnvioService {
  async registrarEnvioConPaquetes(envio: any, paquetes: any[]): Promise<any> {
    logger.info(`EnvioService:registrarEnvioConPaquetes - Inicio`)
    const direccionOrigen = `${envio.origen.ciudad}, ${envio.origen.pais}`
    const direccionDestino = `Calle ${envio.destino.calle} # ${envio.destino.carrera} - ${envio.destino.complemento}, ${envio.destino.ciudad}, ${envio.destino.pais}`;
    logger.debug(`EnvioService:registrarEnvioConPaquetes - origen: ${direccionOrigen}`)
    logger.debug(`EnvioService:registrarEnvioConPaquetes - direccionDestino formateada: ${direccionDestino}`)
    
    // Validación destino valido
    const destinoValido = await validarDireccionConGeocoder(direccionDestino);
    if (!destinoValido) {
      logger.debug(`EnvioService:registrarEnvioConPaquetes - Error direccionDestino invalida`)
      throw new Error('La dirección de destino no es válida');
    }
    
    logger.debug(`EnvioService:registrarEnvioConPaquetes - validacion de destino correcto`)

    // Calcular total de peso y volumen de los paquetes
    const totalPesoLb = paquetes.reduce((acc, pkg) => acc + pkg.peso_lb, 0);
    const totalVolumenCm3 = paquetes.reduce(
      (acc, pkg) => acc + (pkg.alto_cm * pkg.ancho_cm * pkg.profundidad_cm),
      0
    );

    // Conversión a kg y cm3 
    const totalPeso = Number((totalPesoLb / 2.20462).toFixed(5))
    const totalVolumen = (totalVolumenCm3 / 1000000)  

    logger.debug(`EnvioService:registrarEnvioConPaquetes - peso total envio: ${JSON.stringify({peso_lb: totalPesoLb, peso_kg: totalPeso})}`)
    logger.debug(`EnvioService:registrarEnvioConPaquetes - volumen total envio: ${JSON.stringify({volumen_cm3: totalVolumenCm3, volumen_m3: totalVolumen})}`)
    
    // Seleccionar vehículo disponible basándose en la ciudad del origen
    const ciudadOrigen = envio.origen.ciudad;
    logger.debug(`EnvioService:registrarEnvioConPaquetes - ciudadOrigen: ${ciudadOrigen}`)

    const vehiculo = await VehiculoRepository.obtenerVehiculoDisponible(totalPeso, totalVolumen, ciudadOrigen);
    if (!vehiculo) {
      logger.error(`EnvioService:registrarEnvioConPaquetes - No hay vehículos disponibles en la ciudad que cumplan con la capacidad requerida`)
      throw new Error('No hay vehículos disponibles en la ciudad que cumplan con la capacidad requerida');
    }

    envio.vehiculo_id = vehiculo.id;
    logger.debug(`EnvioService:registrarEnvioConPaquetes - asignación de vehiculo correcta: ${vehiculo.id}`)
    // Crear el envío (almacenando tanto origen como destino)
    logger.debug(`EnvioService:registrarEnvioConPaquetes - creación de envío: ${JSON.stringify(envio)}`)
    const nuevoEnvio = await EnvioRepository.create(envio);
    
    logger.debug(`EnvioService:registrarEnvioConPaquetes - nuevoEnvio response repository: ${JSON.stringify(nuevoEnvio)}`)
    // Asociar cada paquete al envío creado
    for (const paquete of paquetes) {
      paquete.envio_id = nuevoEnvio.insertId;
      await PaqueteRepository.create(paquete);
    }

    logger.debug(`EnvioService:registrarEnvioConPaquetes - paquetes asociados al envío`)
    
    // Actualizar la capacidad disponible del vehículo
    await VehiculoRepository.actualizarCapacidad(vehiculo.id, totalPeso, totalVolumen);
    
    logger.info(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo actualizadas`)


    // Calcular el porcentaje de utilización
    const usedKg = vehiculo.capacidad_kg_original - vehiculo.kg_disponible;
    const usageKg = usedKg / vehiculo.capacidad_kg_original;
    const usedVol = vehiculo.volumen_total_m3 - vehiculo.volumen_disponible_m3;
    const usageVol = usedVol / vehiculo.volumen_total_m3;

    logger.debug(`EnvioService:registrarEnvioConPaquetes - porcentajes de ocupación vehiculo: ${JSON.stringify({vehiculoId: vehiculo.id, usoKg: usageKg, volumenOcupado: usageVol} )}`)
    
    // Si se supera el 90% de utilización de peso o volumen
    const capacidadMinima = 0.9
    if (usageKg >= capacidadMinima || usageVol >= capacidadMinima) {
      logger.debug(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - Disponible para salir`) 
      // Actualizar el vehículo a "Ocupado"
      await VehiculoRepository.actualizarEstado(vehiculo.id, 'Ocupado');
      logger.debug(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - Actualización de estado vehiculo a ocupado`)
      // Asignar un transportista (filtrado por la misma ciudad de origen)
      const transportista = await TransportistaRepository.obtenerTransportistaDisponible(ciudadOrigen);

      if (!transportista) {
        logger.error(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - No se han encontrado conductores disponibles`)
        throw new Error('No hay transportistas disponibles en la ciudad');
      }
      logger.debug(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - Asignación de conductor correcta`)
      await TransportistaRepository.actualizarEstado(transportista.id, 'Ocupado');
      logger.debug(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - Actualización correcta del estado del conductor a Ocupado`)
      // Actualizar el estado de todos los envíos asociados a ese vehículo de "En espera" a "En tránsito"
      await EnvioRepository.actualizarEstadoEnviosPorVehiculo(vehiculo.id);
      logger.debug(`EnvioService:registrarEnvioConPaquetes - capacidades de vehiculo por encima del ${capacidadMinima*100}% - Actualización correcta del estado de los envios asociados a ese vehiculo`)
      
      // Determinar la ruta idónea consultando la tabla de rutas:
      // Se asume que la tabla rutas contiene registros con columnas 'origen' y 'destino' (usaremos la ciudad)
      const sqlRoute = `SELECT * FROM rutas WHERE origen = ? AND destino = ? LIMIT 1`;
      const rutas = await Database.query(sqlRoute, [envio.origen.ciudad, envio.destino.ciudad]);
      if (rutas.length > 0) {
        const ruta = rutas[0];
        // Actualizar el envío con la ruta definida
        const sqlUpdateRoute = `UPDATE envios SET ruta_id = ? WHERE id = ?`;
        await Database.query(sqlUpdateRoute, [ruta.id, nuevoEnvio.insertId]);
        // Actualizar todos los paquetes para ese envío con la misma ruta
        const sqlUpdatePaquetes = `UPDATE paquetes SET ruta_id = ? WHERE envio_id = ?`;
        await Database.query(sqlUpdatePaquetes, [ruta.id, nuevoEnvio.insertId]);
      }
    }
    
    // Notificar al usuario por correo (consultar el campo correo de la tabla usuarios)
    const sqlUser = `SELECT correo FROM usuarios WHERE id = ?`;
    const result = await Database.query(sqlUser, [envio.usuario_id]);
    const correoUsuario = result.length > 0 ? result[0].correo : null;
    if (correoUsuario) {
      const asunto = 'Confirmación de Creación de Envío';
      const mensaje = `Su envío con ID ${nuevoEnvio.insertId} ha sido creado en estado "En espera".
Origen: ${direccionOrigen}.
Destino: ${direccionDestino}.
Vehículo asignado: ${vehiculo.matricula}.`;
      await enviarNotificacionEmail(correoUsuario, asunto, mensaje);
    }
    
    return { envio: nuevoEnvio, vehiculo, paquetes };
  }
  
  async obtenerEnvioConPaquetes(envioId: number): Promise<any> {
    const envio = await EnvioRepository.findById(envioId);
    const paquetes = await PaqueteRepository.findByEnvioId(envioId);
    return { envio, paquetes };
  }
}

export default new EnvioService();