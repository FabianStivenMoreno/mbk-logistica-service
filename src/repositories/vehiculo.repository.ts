import Database from '../config/database';

class VehiculoRepository {
  async obtenerVehiculoDisponible(totalPeso: number, totalVolumen: number, ciudadOrigen: string): Promise<any> {
    const sql = `
      SELECT * FROM vehiculos
      WHERE estado = 'Disponible'
        AND kg_disponible >= ?
        AND volumen_disponible_m3 >= ?
        AND ciudad = ?
      LIMIT 1
    `;
    const resultados = await Database.query(sql, [totalPeso, totalVolumen, ciudadOrigen]);
    return resultados.length > 0 ? resultados[0] : null;
  }

  async actualizarCapacidad(vehiculoId: number, pesoAsignado: number, volumenAsignado: number): Promise<void> {
    const sql = `
      UPDATE vehiculos
      SET kg_disponible = kg_disponible - ?,
          volumen_disponible_m3 = volumen_disponible_m3 - ?
      WHERE id = ?
    `;
    await Database.query(sql, [pesoAsignado, volumenAsignado, vehiculoId]);
  }

  async actualizarEstado(vehiculoId: number, estado: string): Promise<void> {
    const sql = `UPDATE vehiculos SET estado = ? WHERE id = ?`;
    await Database.query(sql, [estado, vehiculoId]);
  }
}

export default new VehiculoRepository();