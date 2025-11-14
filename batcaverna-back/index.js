import express from 'express';
const app = express();
const port = process.env.PORTA || 3000;

import cors from 'cors';

app.use(cors());
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

app.listen(port, () => {console.log(`Servidor rodando em http://localhost:${port}`)})