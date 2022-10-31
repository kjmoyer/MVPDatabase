const express = require('express');
const pg = require('pg');
require('dotenv').config();
const cors = require('cors')
const path = require('path')
const Pool = pg.Pool;
const bcrypt = require("bcrypt");


const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PW,
  port: process.env.PORT,
})


const app = express();
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.json());
app.use(cors());

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
  pool.query(`SELECT characters.name, characters.class, characters.guildmember, characters.secondaryspecid, characters.specid, specs.specName, specs.specIcon, specs.buffs, specs.debuffs from characters INNER JOIN specs on characters.specId = specs.specId WHERE characters.name = $1`, [req.query.name])
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
    .then((rows) => {
      res.status(200).send(rows)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).send(err)
    })
});

app.get('/buffs', (req, res) => {
  pool.query(`SELECT * FROM buffs`)
    .then(({ rows }) => {
      res.status(200).send(rows);
    })
    .catch((err) => {
      console.log(err);
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

app.get('/guild', async (req, res) => {
  const saltRounds = 5;
  let guildHash = '';
    pool.query(`SELECT password FROM guilds WHERE guildname = ${"\'" + req.query.guildname + "\'"}`)
    .then(({ rows }) => {
      if (rows.length === 0) {
        throw new Error ('Guild is not registered');
      }
      guildHash = rows[0].password;
      return bcrypt.compare(req.query.password, rows[0].password)
    })
    .then((result) => {
      if (result === false) {
        throw new Error('Password is incorrect');
      }
      res.status(200).send(guildHash);
    })
    .catch((err) => {
      res.status(400).send(err.message);
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

app.post('/guild', async (req, res) => {
  pool.query(`SELECT guildid FROM guilds`)
    .then(({ rows }) => {
      if (rows.length > 0) {
        throw new Error('Guild already exists, please log in with the guild name and password');
      }
    })
    .then(() => {
      const saltRounds = 5;
      return bcrypt.genSalt(saltRounds)
    })
    .then(salt => {
      return bcrypt.hash(req.body.password, salt);
    })
    .then(async (hash) => {
      const values = [req.body.guildname, hash];
      await pool.query(`INSERT INTO guilds (guildname, password) VALUES ($1, $2)`, values);
      res.status(201).send(hash);
    })
    .catch((err) => {
      res.status(400).send(err)
    })
})

app.delete('/char', (req, res) => {
  pool.query(`DELETE FROM characters WHERE name='${req.query[0]}'`)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      res.status(400).send(err);
    })
})

app.put('/char', (req, res) => {
  const char = req.body;
  const values = [char.class, char.specid, char.secondarySpecid, char.guildmember, char.name];
  pool.query(`UPDATE characters SET class = $1, specId = $2, secondarySpecid = $3, guildmember = $4 where name = $5`, values)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      res.status(500).send(err);
    })
})


app.listen(3000, () => {
  console.log('Listening on port 3000')
});