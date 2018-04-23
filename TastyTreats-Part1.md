# Tasty Treats : Part I

## Overview
Create a full stack app with full CRUD functionality about Tasty Treats. 
Part I : The Back End

### Technologies
- Database: PostgreSQL
- Server: Express
- Front End : jQuery, Handlebars and PageJS


## Phase 1 : Database
Launch `psql` shell from terminal

Create Database

- `CREATE DATABASE tasty_treats;`
	- Confirm new database shows in list via `\l`

Create Table

- Connect to database `\c tasty_treats`
- `CREATE table treats (id SERIAL PRIMARY KEY, name VARCHAR(256) NOT NULL, description TEXT);`
- Confirm new table `\d treats`
	- Should see 3 columns of appropriate type. 
	- Note that id has default of `nextval(...`

Test CRUD operations

- `SELECT * FROM treats;`
	- Should display zero rows
- `INSERT INTO treats (name, description) VALUES('carrot cake', 'plausibly healthy');`
- `SELECT * FROM treats;`
	- Should show 1 row with correct info plus an id, note the id. 
	- These steps assume id = 1
- `UPDATE treats SET description='Really not healthy' WHERE id=1;`
- `SELECT * FROM treats WHERE id=1;`
	- Should display one row with updated information
- `DELETE FROM treats WHERE id=1;`
- `SELECT * FROM treats;`
	- Confirm that zero rows are displayed

### Database is good to go!

---

## Phase 2 : Server

Create an Express server

- create a folder for your server and make new file named `server.js`
- In your server project folder run `npm init`
- We're eventually going to use several NPM packages but let's start with the bare minimum
- `npm install express`
- Add bare minimum JavaScript to `server.js` to get server running.

        const express = require('express');
        const PORT = 3000;
        const app = express();
        app.listen(PORT, () => console.log('Listening on PORT', PORT));
    
- From terminal run `nodemon server.js`
	- Confirm terminal output shows `Listening on PORT 3000`

Test Server

- add a simple test route to `server.js`
	- E.g. `app.get('/ping', (request, response) => response.send('pong'));`
	- Using tool of your choice (Postman, httpie, or just a browser for this simple case) navigate to `http://localhost:3000/ping`
	- confirm response is `pong`

Externalize Dependencies

Since we'll want to run this app remotely as well as locally we want to have a flexible way of defining the `PORT` constant.

- `npm install dotenv`
- create `.env` file in root of your project
	- NOTE: Do NOT commit `.env` file to Github.
- add `PORT=3000` to `.env` file
- add `require('dotenv').config();` somewhere near the beginning of `server.js` BEFORE `PORT` is used
- Change line `const PORT = 3000;` to `PORT = process.env.PORT`;
- Restart server and confirm app is listening on correct port.


Connect to Database

- `npm install pg`
	- add `DATABASE_URL` to `.env` file with path to your local Postgres database
		- On my Mac this is `postgres://localhost/tasty_treats` but exact path varies by operating system. 
	- add `const pg = require('pg');` to `server.js`
	- add `const client = new pg.Client(process.env.DATABASE_URL);` to `server.js`
	- add `client.connect();` on next line.
	- add `client.on('error', err => console.error(err));` on next line.


Add GET /treats route

    app.get('/treats', (request, response) => {
    
        client.query('SELECT * FROM treats;')
            .then(results => response.send(results.rows))
            .catch(err => response.status(500).send(err));
    });
- confirm that server responds with [] using the testing tool of your choice

Add POST /treats route

-   add middleware to parse request body

        app.use(express.urlencoded({extended:true}));
        app.use(express.json());
        
- Add post route handler

        app.post('/treats', (request, response) => {
        client.query(`
            INSERT INTO treats (name, description) VALUES('${request.body.name}', '${request.body.description}');
            `).then(results =>response.sendStatus(200));
            }).catch(err => response.status(500).send(err));
	- Confirm that post route properly adds treat.
- Add PUT route handler

        app.put('/treats/:id', (request, response) => {
            client.query(`UPDATE treats SET name=$1, description=$2 WHERE id=$3;`, 
            [
            request.body.name,
            request.body.description,
            request.params.id
            ]).then(results => response.sendStatus(200));
            }).catch(err => response.status(500).send(err));
            
    - make PUT request to update a record using testing tool of your choice
    - confirm that record has been updated by making request to GET treats and checking response

Add DELETE route

    app.delete('/treats/:id', (request, response) => {
    client.query(`DELETE from treats WHERE id=${request.params.id}`)
        .then(results => response.sendStatus(200))
        .catch(err => response.status(500).send(err));
    });
- Make an http request to delete record
- Confirm that record has been deleted

Add GET single treat route

    app.get('/treats/:id', (request, response) => {

        client.query(`SELECT * FROM treats WHERE id=${request.params.id};`)
          .then(results => response.send(results.rows[0]))
          .catch(err => response.status(500).send(err));
    });
- Note: the response is single treat record, not an array.

## Congratulations, server is done! 
##Front End coming in Part II