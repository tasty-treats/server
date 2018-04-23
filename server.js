const express = require('express');
require('dotenv').config();

const pg = require('pg');
const PORT = process.env.PORT;

const app = express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err)); 

app.get('/ping', (request, response) => response.send('pong'));

app.get('/treats', (request, response) => {

    client.query('SELECT * FROM treats;')
        .then(results => response.send(results.rows))
});

app.get('/treats/:id', (request, response) => {

    client.query(`SELECT * FROM treats WHERE id=${request.params.id};`)
        .then(results => response.send(results.rows[0]))
        .catch(err => response.status(500).send(err));
});

app.post('/treats', (request, response) => {

    client.query(`INSERT INTO treats (name, description) VALUES('${request.body.name}', '${request.body.description}');`)
        .then(results => response.sendStatus(200))
        .catch(err => response.status(500).send(err));
});

app.put('/treats/:id', (request, response) => {

    client.query(`UPDATE treats SET name=$1, description=$2 WHERE id=$3;`, 
    [
        request.body.name,
        request.body.description,
        request.params.id
    ]).then(results => response.sendStatus(200))
    .catch(err => response.status(500).send(err));
});

app.delete('/treats/:id', (request, response) => {
    client.query(`DELETE from treats WHERE id=${request.params.id}`)
        .then(results => response.sendStatus(200))
        .catch(err => response.status(500).send(err));
});

app.listen(PORT, () => console.log('Listening on PORT', PORT));