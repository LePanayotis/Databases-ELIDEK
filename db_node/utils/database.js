const { Pool }= require('pg');

/* create connection and export it */
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "0000",
    database: "panagiorgis",
});

pool.on('connect', () => {
    console.log('pool connected');
})
module.exports = {
    query: (text, params) => pool.query(text, params)
}
module.exports = pool;