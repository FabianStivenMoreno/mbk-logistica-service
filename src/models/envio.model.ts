class Envio {
  constructor(
    public id: number,
    public estadoActual: 'En espera' | 'En tránsito' | 'Entregado',
    public usuarioId: number,
    public vehiculoId?: number,
    public transportistaId?: number
  ) {}
}

export default Envio;