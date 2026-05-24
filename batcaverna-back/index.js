import express from 'express';
const app = express();
const port = process.env.PORTA || 3000;

import cors from 'cors';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim())

app.use(cors({
    origin: (origin, callback) => {
        // permite requisições sem origin (ex: curl, Postman) e origens na lista
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error(`CORS: origem não permitida → ${origin}`))
        }
    },
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}))

// responde imediatamente ao preflight de qualquer rota
app.options('*', cors());
app.use(express.json());

//ROTAS
app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center;">Batcaverna is Online!</h1>');
})

import usuario from './routes/usuario.js';
app.use('/usuario', usuario);

import professor from './routes/professor.js';
app.use('/professor', professor);

import calendario from './routes/calendario.js';
app.use('/calendario', calendario);

import curso from './routes/curso.js';
app.use('/curso', curso);

import turma from './routes/turma.js';
app.use('/turma', turma);

import diario from './routes/diario.js';
app.use('/diario', diario);

import painel from './routes/painel.js';
app.use('/painel', painel);

import fila from './routes/fila.js';
app.use('/fila', fila);

app.listen(port, () => {console.log(`Servidor rodando em http://localhost:${port}`)})