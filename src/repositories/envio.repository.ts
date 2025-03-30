import Database from '../config/database';

class EnvioRepository {
  async create(envio: any): Promise<any> {
    const sql = `
      INSERT INTO envios 
        (estado_actual, usuario_id, vehiculo_id, origen_pais, origen_ciudad, origen_calle, origen_carrera, origen_complemento, latitud_origen, longitud_origen,
         destino_pais, destino_ciudad, destino_calle, destino_carrera, destino_complemento, latitud_destino, longitud_destino, ruta_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      envio.estado_actual || 'En espera',
      envio.usuario_id,
      envio.vehiculo_id || null,
      envio.origen.pais,
      envio.origen.ciudad,
      envio.origen.calle,
      envio.origen.carrera,
      envio.origen.complemento || null,
      envio.origen.latitud || null,
      envio.origen.longitud || null,
      envio.destino.pais,
      envio.destino.ciudad,
      envio.destino.calle,
      envio.destino.carrera,
      envio.destino.complemento || null,
      envio.destino.latitud || null,
      envio.destino.longitud || null,
      envio.ruta_id || null,
    ];
    return await Database.query(sql, params);
  }

  async findById(envioId: number): Promise<any> {
    const sql = `SELECT * FROM envios WHERE id = ?`;
    const resultados = await Database.query(sql, [envioId]);
    return resultados[0];
  }

  async actualizarEstadoEnviosPorVehiculo(vehiculoId: number): Promise<void> {
    const sql = `
      UPDATE envios 
      SET estado_actual = 'En tránsito'
      WHERE vehiculo_id = ? AND estado_actual = 'En espera'
    `;
    await Database.query(sql, [vehiculoId]);
  }
}

export default new EnvioRepository();