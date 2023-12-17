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

let creators = await client.query('SELECT name FROM creators');
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
async function addSurvey(username, title, questions) {
    let res = await client.query(`select addSurvey($$${username}$$, $$${title}$$) as id`);
    // let res = await client.query(`
    //     insert into surveys (creator_id,name)
    //     values (
    //         (select id from creators where name='${username}'),
    //         $$${title}$$)
    //     returning id;
    // `);
    console.log('res', res.rows);
    let survey_id = res.rows[0].id;
    console.log(`survey_id = ${survey_id}`);
    questions.forEach(async (question) => {
        await client.query(`
            insert into questions (survey_id, question, answer_type)
            values (${survey_id},$$${question.question_text}$$,$$${question.answer_type}$$)`
        );
    });
}

app.get('', (req, res) => { res.redirect(format({ pathname: '/login' })); return; });
app.get('/', (req, res) => { res.redirect(format({ pathname: '/login' })); return; });
app.get('/login', async (req, res) => {
    console.log('login rout');
    console.log(req.query);

    let _showWarning = false, _showRegistered = false, _message = '';

    if (Object.keys(req.query).length == 0) {
        console.log('null query');
        _showWarning = false;
        _showRegistered = false;
        _message = '';
    } else if (req.query.action == 'login') {
        console.log('user logging in');
        let userVerified = await verifyUser(req.query.username, req.query.password);
        if (userVerified) {
            res.redirect(format({
                pathname: '/index',
                query: { username: req.query.username }
            }));
            return;
        } else {
            _showWarning = true;
            _showRegistered = false;
            _message = 'Wrong username or password';
        }
    } else if (req.query.action == 'register') {
        console.log('user registering');
        res.redirect(format({
            pathname: '/register',
            query: {}
        }));
        return;
    } else if (req.query.action == 'regSuccess') {
        _showWarning = false;
        _showRegistered = true;
        _message = 'created new user!, you can login now';
    }

    res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: _showWarning, showRegistered: _showRegistered, message: _message });
});
app.get('/register', (req, res) => { res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: false, showSuccess: false, message: '' }) });
app.post('/register', async (req, res) => {
    console.log(req.body);
    let data = {
        username: req.body.username,
        password: req.body.password,
        repassword: req.body.repassword
    }
    console.log(data);


    // guard statements
    if (data.username == null || data.username.length <= 3) { // username too short
        console.log('username too short');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'username too short' });
        return;
    }
    if (await verifyUser(data.username, data.password)) { // user already exists
        console.log('user already exists');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'username already exists' });
        return;
    }
    if (data.password?.length < 3) { // short password
        console.log('password too short');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'password too short' });
        return;
    }
    if (data.password != data.repassword) { // repeat password different
        console.log('passwords not same');
        res.render(join(__dirname, '..', 'frontend', 'register.ejs'), { showWarning: true, showSuccess: false, message: 'repeat password exactly' });
        return;
    }

    console.log(`creating new user: \n username: ${data.username} \n password: ${data.password}`);
    await client.query(`
        insert into creators (name,pass)
        values ('${data.username}','${data.password}');
        `);
    if (await verifyUser(data.username, data.password)) {
        res.redirect(format({
            pathname: '/login',
            query: {
                action: 'regSuccess'
            }
        }));
        return;
    } else {
        res.render(join(__dirname, '..', 'frontend', 'login.ejs'), { showWarning: true, showRegistered: false, message: 'database error!' });
    }
});
app.get('/index', async (req, res) => {
    console.log(req.query);

    if (Object.keys(req.query).length == 0) {
        res.redirect(format({ pathname: '/login' })); return;
    }

    let username = req.query.username;
    let createdSurveys = await getUserSurveys(username);

    res.render(join(__dirname, '..', 'frontend', 'index.ejs'), {
        creatorName: username,
        createdSurveys: createdSurveys.rows
    })
});
app.get('/index.js', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'index.js')); });
app.get('/survey.html', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey.html')); });
app.get('/survey-creator.html', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.html')); });
app.get('/survey-creator.js', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.js')); });
app.post('/submitSurvey', async (req, res) => {
    console.log(req.body);
    await addSurvey(req.body.username, req.body.surveyTitle, req.body.surveyQuestions);
})

app.listen(port, () => { console.log(`Started server on port ${port}`); });
