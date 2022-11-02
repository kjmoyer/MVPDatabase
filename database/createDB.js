require('dotenv').config();
const pg = require('pg');
const axios = ('axios');
const Client = pg.Client;

(async function createDatabase() {
  const client = new Client({
    user: process.env.USER,
    host: process.env.HOST,
    database: 'postgres',
    password: process.env.PW,
    port: process.env.PORT,
  })
  await client.connect();
  await client.query(`DROP DATABASE IF EXISTS ${process.env.DATABASE}`);
  await client.query(`CREATE DATABASE ${process.env.DATABASE} WITH ENCODING 'UTF8';`);
  await client.end();
  (async function createTables() {
    const client = new Client({
      user: process.env.USER,
      host: process.env.HOST,
      database: process.env.DATABASE,
      password: process.env.PW,
      port: process.env.PORT,
    })

    await client.connect()
    await client.query(`CREATE TABLE buffs (
      buffId SERIAL PRIMARY KEY,
      effect TEXT,
      buffIcon TEXT
      )`)

    await client.query(`CREATE TABLE debuffs (
      buffId SERIAL PRIMARY KEY,
      effect TEXT,
      buffIcon TEXT
      )`)

    await client.query(`CREATE TABLE specs (
      specId SERIAL PRIMARY KEY,
      className TEXT,
      specName TEXT,
      specIcon TEXT,
      buffs INT[],
      debuffs INT[],
      raidstats INT[]
      )`)

    await client.query(`CREATE TABLE guilds(
      guildId SERIAL PRIMARY KEY,
      guildname TEXT UNIQUE,
      password TEXT
      )`)

    await client.query(`CREATE TABLE characters (
      charId SERIAL PRIMARY KEY,
      name TEXT UNIQUE,
      class TEXT,
      specId int references specs(specId),
      secondarySpecId int references specs(specId),
      guildId int references guilds(guildId),
      guildMember bool
      )`)

    await client.query(`CREATE TABLE raidstats(
      statid SERIAL PRIMARY KEY,
      name TEXT
    )`)

    await client.end();
  })();
})();
