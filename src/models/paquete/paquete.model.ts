class Paquete {
  constructor(
    public id: number,
    public pesoLb: number,
    public altoCm: number,
    public anchoCm: number,
    public profundidadCm: number,
    public tipoProducto: string,
    public esDelicado: boolean,
    public envioId: number,
    public rutaId?: number
  ) {}

  static fromRequest(data: Partial<Paquete>): Paquete {
    return new Paquete(
      data.id || 0,
      data.pesoLb!,
      data.altoCm!,
      data.anchoCm!,
      data.profundidadCm!,
      data.tipoProducto!,
      data.esDelicado!,
      data.envioId!,
      data.rutaId
    );
  }
}

export default Paquete;
