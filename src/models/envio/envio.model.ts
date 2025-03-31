class Envio {
  constructor(
    public id: number,
    public estadoActual: 'En espera' | 'En tránsito' | 'Entregado',
    public usuarioId: number,
    public origenCiudadId: number,
    public destinoCiudadId: number,
    public destino: {
      calle: string;
      carrera: string;
      complemento?: string;
      detalle?: string;
    },
    public vehiculoId?: number,
    public transportistaId?: number,
    public rutaId?: number 
  ) {}

  static fromRequest(data: Partial<Envio>): Envio {
    return new Envio(
      data.id || 0,
      data.estadoActual || 'En espera',
      data.usuarioId!,
      data.origenCiudadId!,
      data.destinoCiudadId!,
      data.destino!,
      data.vehiculoId,
      data.transportistaId,
      data.rutaId
    );
  }
}

export default Envio;
