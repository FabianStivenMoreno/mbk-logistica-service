import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import envioRoutes from './routes/envio/envio.routes';


// Rutas


dotenv.config()

const app = express()

// Config
app.use(express.json())
app.use(morgan('dev'));

const raiz = process.env.ROOT_PATH || '/'

// Configurar las rutas
app.use(`${raiz}/envios`, envioRoutes);

const port = process.env.PUERTO || 5000

if(process.env.NODE_ENV !== 'test'){
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`)
    console.log(`API disponible en: http://localhost:${port}${raiz}`);
  })
}


export default app;
