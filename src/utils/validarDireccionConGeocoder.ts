import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

/**
 * Valida que la dirección (cadena completa) se pueda geocodificar.
 */
export const validarDireccionConGeocoder = async (direccion: string): Promise<boolean> => {
  try {
    const resultados = await geocoder.geocode(direccion);
    return Array.isArray(resultados) && resultados.length > 0;
  } catch (error: any) {
    console.error('Error al validar la dirección:', error.message);
    throw new Error('No se pudo validar la dirección');
  }
};