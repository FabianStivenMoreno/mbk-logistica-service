import EnvioRepository from '../repositories/envio.repository';
import PaqueteRepository from '../repositories/paquete.repository';
import VehiculoRepository from '../repositories/vehiculo.repository';
import TransportistaRepository from '../repositories/transportista.repository';
import { validarDireccionConGeocoder } from '../utils/validarDireccionConGeocoder';
import { enviarNotificacionEmail } from '../utils/notificacionEmail';
import Database from '../config/database';

class EnvioService {
  async registrarEnvioConPaquetes(envio: any, paquetes: any[]): Promise<any> {
    // Armar direcciones completas
    const direccionOrigen = `${envio.origen.calle} ${envio.origen.carrera}${envio.origen.complemento ? ' ' + envio.origen.complemento : ''}, ${envio.origen.ciudad}, ${envio.origen.pais}`;
    const direccionDestino = `${envio.destino.calle} ${envio.destino.carrera}${envio.destino.complemento ? ' ' + envio.destino.complemento : ''}, ${envio.destino.ciudad}, ${envio.destino.pais}`;
    
    // Validar ambas direcciones (aquí se puede validar únicamente destino si se prefiere)
    const origenValido = await validarDireccionConGeocoder(direccionOrigen);
    const destinoValido = await validarDireccionConGeocoder(direccionDestino);
    if (!origenValido || !destinoValido) {
      throw new Error('La dirección de origen o destino no es válida');
    }
    
    // Calcular total de peso y volumen de los paquetes
    const totalPeso = paquetes.reduce((acc, pkg) => acc + pkg.peso, 0);
    const totalVolumen = paquetes.reduce(
      (acc, pkg) => acc + (pkg.alto_metros * pkg.ancho_metros * pkg.profundidad_metros),
      0
    );
    
    // Seleccionar vehículo disponible basándose en la ciudad del origen
    const ciudadOrigen = envio.origen.ciudad;
    const vehiculo = await VehiculoRepository.obtenerVehiculoDisponible(totalPeso, totalVolumen, ciudadOrigen);
    if (!vehiculo) {
      throw new Error('No hay vehículos disponibles en la ciudad que cumplan con la capacidad requerida');
    }
    envio.vehiculo_id = vehiculo.id;
    
    // Crear el envío (almacenando tanto origen como destino)
    const nuevoEnvio = await EnvioRepository.create(envio);
    
    // Asociar cada paquete al envío creado
    for (const paquete of paquetes) {
      paquete.envio_id = nuevoEnvio.insertId;
      await PaqueteRepository.create(paquete);
    }
    
    // Actualizar la capacidad disponible del vehículo
    await VehiculoRepository.actualizarCapacidad(vehiculo.id, totalPeso, totalVolumen);
    
    // Calcular el porcentaje de utilización
    const usedKg = vehiculo.capacidad_kg_original - vehiculo.kg_disponible;
    const usageKg = usedKg / vehiculo.capacidad_kg_original;
    const usedVol = vehiculo.volumen_total_m3 - vehiculo.volumen_disponible_m3;
    const usageVol = usedVol / vehiculo.volumen_total_m3;
    
    // Si se supera el 90% de utilización de peso o volumen...
    if (usageKg >= 0.9 || usageVol >= 0.9) {
      // Actualizar el vehículo a "Ocupado"
      await VehiculoRepository.actualizarEstado(vehiculo.id, 'Ocupado');
      
      // Asignar un transportista (filtrado por la misma ciudad de origen)
      const transportista = await TransportistaRepository.obtenerTransportistaDisponible(ciudadOrigen);
      if (!transportista) {
        throw new Error('No hay transportistas disponibles en la ciudad');
      }
      await TransportistaRepository.actualizarEstado(transportista.id, 'Ocupado');
      
      // Actualizar el estado de todos los envíos asociados a ese vehículo de "En espera" a "En tránsito"
      await EnvioRepository.actualizarEstadoEnviosPorVehiculo(vehiculo.id);
      
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