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
  pool.query(`SELECT characters.name, characters.secondaryspecid,characters.specid, characters.class, specs.specname, specs.specIcon, specs.buffs, specs.debuffs from characters INNER JOIN specs on characters.specId = specs.specId WHERE guildMember = ${req.query.guildMember} ORDER BY characters.name`)
    .then(async ({ rows }) => {
      await Promise.all(rows.map(async (row, index) => {
        let data = await pool.query(`SELECT specicon, specName, buffs, debuffs FROM specs where specid = $1`, [row.secondaryspecid]);
        rows[index].secondarySpecIcon = data.rows[0].specicon;
        rows[index].secondaryBuffs = data.rows[0].buffs;
        rows[index].secondaryDebuffs = data.rows[0].debuffs;
        rows[index].secondarySpecName = data.rows[0].specname;
      }))
      return rows
    })
    .then((data) => {
      res.status(200).send(data)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
});

app.get('/char', (req, res) => {
  pool.query(`SELECT characters.name, characters.class, characters.guildmember, specs.specName, specs.specIcon, specs.buffs, specs.debuffs from characters INNER JOIN specs on characters.specId = specs.specId WHERE characters.name = $1`, [req.query.name])
    .then(({ rows }) => {
      res.status(200).send(rows)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
});

// app.get('/char/OS', (req, res) => {
//   pool.query(`SELECT c.name, c.specId as secondaryspecid , c.class, s.specName, s.specIcon, s.buffs, s.debuffs from characters c INNER JOIN specs s on c.secondaryspecId = s.specId WHERE c.name = $1`, [req.query.name])
//   .then(async ({ rows }) => {
//     await Promise.all(rows.map(async (row, index) => {
//       let data = await pool.query(`SELECT specicon FROM specs where specid = $1`, [row.secondaryspecid]);
//       rows[index].secondarySpecIcon = data.rows[0].specicon;
//       }))
//       // console.log('row after insertion: ', rows[index]);
//     return rows
//   })
//   .then((rows ) => {
//       res.status(200).send(rows)
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).send(err);
//     })
// })



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

app.get('/specs/buffs', (req, res) => {
  pool.query(`SELECT className, specName from specs where $1=ANY(${req.query.buffType})`, [req.query.id])
    .then(({ rows }) => {
      res.status(200).send(rows)
    })
    .catch((err) => {
      res.status(500).send(err)
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