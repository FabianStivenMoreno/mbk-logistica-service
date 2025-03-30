class Paquete {
    constructor(
      public id: number,
      public peso: number,
      public alto: number,
      public ancho: number,
      public profundidad: number,
      public tipoProducto: string,
      public esDelicado: boolean,
      public envioId: number,
      public rutaId?: number
    ) {}
  }
  
  export default Paquete;