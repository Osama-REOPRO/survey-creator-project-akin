import express from "express"
import morgan from "morgan"
import { dirname, join } from "path";
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url));
import pg from "pg";

const app = express();
const port = 3000;
app.use(morgan("tiny"));


const client = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "surveys",
    password: "admin",
    port: "5432",
});
client.connect();

const creators = await client.query('SELECT * FROM creators');
console.log(creators.rows);

async function checkUser(uname, pass) {
    const res = await client.query(`
        select count(*)
        from creators
        where name = '${uname}' and pass = '${pass}'
    `);

    return (res.rows[0].count > 0) ? true : false;
}

async function getCreatedSurveys(username){
    return await client.query(`
        SELECT surveys.name
        FROM creators
        JOIN surveys
        ON creators.id = surveys.creator_id
        WHERE creators.name = '${username}'
    `);
}

app.get("/", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'index.html')); });
app.get("/index.js", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'index.js')); });
app.get("/survey.html", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey.html')); });
app.get("/survey-creator.html", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.html')); });

app.listen(port, () => { console.log(`Started server on port ${port}`); });