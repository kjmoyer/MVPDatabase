const express = require('express');
// const path from 'path';
// const { fileURLToPath } from 'url';
const pg = require('pg');
require('dotenv').config();
const cors = require('cors')
const Pool = pg.Pool;

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PW,
  port: process.env.PORT,
})

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
// app.use(express.static(path.join(__dirname, '../index.html')))

app.get('/chars', (req, res) => {
  pool.query(`SELECT characters.name, characters.class, specs.specName, specs.specIcon, specs.buffs, specs.debuffs from characters INNER JOIN specs on characters.specId = specs.specId WHERE guildMember = ${req.query.guildMember}`)
    .then(({ rows }) => {
      res.status(200).send(rows)
    })
    .catch((err) => {
      console.log(err)
    })
});

// app.get('/char', (req, res) => {
//   pool.query(`SELECT characters.name, characters.class, specs.specName, specs.specIcon, specs.buffs, specs.debuffs from characters INNER JOIN specs on characters.specId = specs.specId WHERE lower(characters.name) like ${req.query.name}`)
//     .then(({ rows }) => {
//       res.status(200).send(rows)
//     })
//     .catch((err) => {
//       res.status(500).send(err);
//     })
// });

app.get('/buffs', (req, res) => {
  pool.query(`SELECT * FROM buffs`)
    .then(({ rows }) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      res.status(500).send(err);
    })
})

app.get('/debuffs', (req, res) => {
  pool.query(`SELECT * FROM debuffs`)
    .then(({ rows }) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      res.status(500).send(err);
    })
})

app.get('/specs', (req, res) => {
  pool.query(`SELECT specname, specid FROM specs WHERE classname = ${"\'" + req.query.class + "\'"};`)
    .then(({ rows }) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      res.status(500).send(err);
    })
})

app.post('/char', (req, res) => {
  let values = [req.body.name, req.body.class, req.body.specid, req.body.secondarySpecid, req.body.guildmember];
  pool.query(`INSERT INTO characters (name, class, specid, secondaryspecid, guildmember) VALUES ($1, $2, $3, $4, $5)`, values)
    .then(({ rows }) => {
      res.status(200).send(rows)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
})



app.listen(3000, () => {
  console.log('Listening on port 3000')
});