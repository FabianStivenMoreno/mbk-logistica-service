import Database from '../config/database';

class TransportistaRepository {
  async obtenerTransportistaDisponible(ciudad: string): Promise<any> {
    const sql = `
      SELECT * FROM transportistas
      WHERE estado = 'Disponible'
        AND ciudad = ?
      LIMIT 1
    `;
    const resultados = await Database.query(sql, [ciudad]);
    return resultados.length > 0 ? resultados[0] : null;
  }

  async actualizarEstado(transportistaId: number, estado: string): Promise<void> {
    const sql = `UPDATE transportistas SET estado = ? WHERE id = ?`;
    await Database.query(sql, [estado, transportistaId]);
  }
}

export default new TransportistaRepository();