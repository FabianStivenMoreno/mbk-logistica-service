import NodeGeocoder from 'node-geocoder';
import logger from '../../services/logger/loggerService';

const options: NodeGeocoder.Options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

/**
 * Valida que la dirección (cadena completa) se pueda geocodificar.
 */
export const validarDireccionConGeocoder = async (direccion: string): Promise<boolean> => {
  logger.info(`**utils** validarDireccionConGeocoder - Inicio`)
  try {
    const resultados = await geocoder.geocode(direccion);
    logger.debug(`**utils** validarDireccionConGeocoder - resultados node-geocoder: ${JSON.stringify(resultados)}`)
    return Array.isArray(resultados) && resultados.length > 0;
  } catch (error: any) {
    logger.error('**utils** validarDireccionConGeocoder - Error al validar la dirección:', error.message);
    throw new Error('No se pudo validar la dirección');
  }
};