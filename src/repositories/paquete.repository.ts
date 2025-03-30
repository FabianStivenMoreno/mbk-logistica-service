import Database from '../config/database';

class PaqueteRepository {
  async create(paquete: any): Promise<any> {
    const sql = `
      INSERT INTO paquetes 
        (peso, alto_metros, ancho_metros, profundidad_metros, tipo_producto, envio_id, ruta_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      paquete.peso,
      paquete.alto_metros,
      paquete.ancho_metros,
      paquete.profundidad_metros,
      paquete.tipo_producto,
      paquete.envio_id,
      paquete.ruta_id || null,
    ];
    return await Database.query(sql, params);
  }

  async findByEnvioId(envioId: number): Promise<any[]> {
    const sql = `SELECT * FROM paquetes WHERE envio_id = ?`;
    return await Database.query(sql, [envioId]);
  }
}

export default new PaqueteRepository();