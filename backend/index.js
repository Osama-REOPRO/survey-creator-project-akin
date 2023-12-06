import express from "express"
import morgan from "morgan"
import { dirname, join } from "path";
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url));
import pg from "pg";

const app = express();
const port = 3000;
app.use(morgan("tiny"));


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "surveys",
    password: "admin",
    port: "5432",
});
db.connect();

async function dbquery(query, log=false) {
    var data;
    await db.query(query, (err, res) => {
            if (err) {
                console.error("Error executing query", err.stack);
                data = 'Error executing query';
            } else {
                log && console.log("query result:", res.rows);
                data = res;
            }
            return data;
    });
    return data;
}
console.log(dbquery("SELECT * FROM creators"));

var userSignedIn = false;
var username;
var password;
function userSignIn(uname, pass) {
    const res = dbquery(`
        select count(*)
        from creators
        where name = '${uname}' and pass = '${pass}'
    `);
    if(res.rows[0].count > 0){
        userSignedIn = true;
        username = uname;
        password = pass;
    }else{
        console.log("Username or password wrong");
    }
}
// console.log(dbquery(`
//                 select count(*)
//                 from creators
//                 where name = 'user1' and pass = 'pass1'
//                     `));
// userSignIn('user1','pass1');

function getCreatedSurveys(username){
    dbquery(`
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