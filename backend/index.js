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
    return await client.query(`select * from getusersurveys($$${username}$$)`);
}
async function addSurvey(username, title, questions) {
    let res = await client.query(`select addSurvey($$${username}$$, $$${title}$$) as id`);
    let survey_id = res.rows[0].id;
    questions.forEach(async (question) => {
        await client.query(`select addQuestion(${survey_id}, $$${question.question_text}$$, $$${question.answer_type}$$) as id`);
    });
    return survey_id;
}
async function editSurvey(survey_id, username, title, questions) {
    deleteSurvey(survey_id);
    await client.query(`select addSurvey($$${survey_id}$$, $$${username}$$, $$${title}$$) as id`);
    questions?.forEach(async (question) => {
        await client.query(`select addQuestion(${survey_id}, $$${question.question_text}$$, $$${question.answer_type}$$) as id`);
    });
}
async function deleteSurvey(id) {
    await client.query(`
        delete from surveys
        where id = $$${id}$$
    `);
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
app.get('/survey.js', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey.js')); });
app.get('/survey', async (req, res) => {
    console.log('query: ', req.query, '\nbody: ', req.body);
    let survey_id = req.query.surveyid;
    let isCreator = req.query.isCreator == 'true';
    let surveyTitle = await client.query(`
        select name from surveys
        where id=${survey_id};
        `);
    console.log(surveyTitle.rows[0].name);
    let survey_questions = await client.query(`
        select id,question,answer_type from questions
        where survey_id = ${survey_id}
        `);
    console.log(survey_questions.rows);
    res.render(join(__dirname, '..', 'frontend', 'survey.ejs'), { isCreator: isCreator, title: surveyTitle.rows[0].name, survey_id: survey_id, questions: survey_questions.rows });
});
app.get('/surveyContents', async (req, res) => {
    let survey_id = req.query.survey_id;
    let surveyTitle = await client.query(`
        select name from surveys
        where id=${survey_id};
        `);
    surveyTitle = surveyTitle.rows[0].name;
    let survey_questions = await client.query(`
        select id,question,answer_type from questions
        where survey_id = ${survey_id}
        `);
    survey_questions = survey_questions.rows;
    res.send({
        title: surveyTitle,
        questions: survey_questions
    })
});
app.get('/editSurvey', (req, res) => {
    console.log('req.query: ', req.query);
    res.redirect(format({
        pathname: '/survey-creator.html',
        query: { survey_id: req.query.survey_id }
    }));
})
app.get('/survey-creator.html', (req, res) => {
    res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.html'));
});
app.get('/survey-creator.js', (req, res) => { res.sendFile(join(__dirname, '..', 'frontend', 'survey-creator.js')); });
app.post('/submitSurvey', async (req, res) => {
    console.log('/submitSurvey req.body', req.body);
    let survey_id = await addSurvey(req.body.username, req.body.surveyTitle, req.body.surveyQuestions);
    res.send({ survey_id: survey_id });
})
app.post('/submitSurveyEdit', async (req, res) => {
    console.log('/submitSurveyEdit req.body', req.body);
    await editSurvey(req.body.survey_id, req.body.username, req.body.surveyTitle, req.body.surveyQuestions);
})
app.post('/deleteSurvey', async (req, res) => {
    console.log(req.body);
    console.log(`deleting survey with id ${req.body.survey_id}`);
    await deleteSurvey(req.body.survey_id);
    res.send(('deleted the survey!'));
})

app.listen(port, () => { console.log(`Started server on port ${port}`); });
