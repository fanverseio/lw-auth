require("dotenv").config();

const postgres = require("postgres");

const pathsDb = postgres(process.env.DATABASE_URL);

module.exports = pathsDb;

/*

import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql


*/
