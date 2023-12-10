import express from "express"
import morgan from "morgan"
import { dirname, join } from "path";
import { fileURLToPath, format } from "url"
import bodyParser from "body-parser"

const __dirname = dirname(fileURLToPath(import.meta.url));
import pg from "pg";

const app = express();
const port = 3000;
app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({ extended: true }));


const client = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "surveys",
    password: "admin",
    port: "5432",
});
client.connect();

const creators = await client.query('SELECT name FROM creators');
console.log('users:', creators.rows);


async function verifyUser(uname, pass) {
    const res = await client.query(`
        select count(*)
        from creators
        where name = '${uname}' and pass = '${pass}'
    `);

    return (res.rows[0].count > 0) ? true : false;
}



async function getUserSurveys(username) {
    return await client.query(`
        SELECT surveys.name
        FROM creators
        JOIN surveys
        ON creators.id = surveys.creator_id
        WHERE creators.name = '${username}'
    `);
}

app.get("/", (req, res) => { res.redirect(format({
    pathname:'/login'
}))});
app.get("/login", async (req, res) => {
    console.log('login rout');
    console.log(req.query);

    if (Object.keys(req.query).length == 0) {
        console.log('null query');
        res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: false, showRegistered: false, message: '' });
    } else if (req.query.action == 'login') {
        console.log('user logging in');
        let userVerified = await verifyUser(req.query.username, req.query.password);
        if (userVerified) {
            res.sendFile(join(__dirname, '..', 'frontend', 'index.html'));
        } else {
            res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: true, showRegistered: false, message: 'Wrong username or password' });
        }
    } else if (req.query.action == 'register') {
        console.log('user registering');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: false, showSuccess: false, message: '' });
    } else if (req.query.action == 'regSuccess') {
        res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: false, showRegistered: true, message: 'created new user!, you can login now' });
    }
});
app.post("/register", async (req, res) => {
    console.log(req.body);
    let data = {
        username: req.body.username,
        password: req.body.password,
        repassword: req.body.repassword
    }
    console.log(data);

    let usernameTooShort = data.username == null || data.username.length <= 3;
    console.log('usernameTooShort', usernameTooShort);
    let userExists = await verifyUser(data.username, data.password);
    console.log('userExists', userExists);
    let shortPass = data.password?.length < 3;
    console.log('shortPass', shortPass);
    let passDiff = data.password != data.repassword;
    console.log('passDiff', passDiff);


    if (usernameTooShort) {
        console.log('username too short');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: "username too short" });
    }
    else if (userExists) {
        console.log('user already exists');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'username already exists' });
    } else if (shortPass) {
        console.log('password too short');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'password too short' });
    } else if (passDiff) {
        console.log('passwords not same');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'repeat password exactly' });
    } else {
        console.log(`creating new user: \n username: ${data.username} \n password: ${data.password}`);
        await client.query(`
        insert into creators (name,pass)
        values ('${data.username}','${data.password}');
        `);
        let userVerified = await verifyUser(data.username, data.password);
        if (userVerified) {
            res.redirect(format({
                pathname: '/login',
                query: {
                    action:'regSuccess'
                }
            }));
            // res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: false, showRegistered: true, message: 'created new user!, you can login now' });
        } else {
            res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: true, showRegistered: false, message: 'database error!' });
        }
    }
});
app.get("/index.js", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'index.js')); });
app.get("/survey.html", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey.html')); });
app.get("/survey-creator.html", (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.html')); });
// app.get("/login", (req, res) => { res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: false, showRegistered: false, message: '' }); });


app.listen(port, () => { console.log(`Started server on port ${port}`); });