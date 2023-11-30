import express from "express"
import morgan from "morgan"
const app = express();
const port = 3000;
app.use(morgan("tiny"));

app.get("/", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/frontend/index.html"); });
app.get("/index.js", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/frontend/index.js"); });
app.get("/survey.html", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/frontend/survey.html"); });
app.get("/survey-creator.html", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/frontend/survey-creator.html"); });

app.listen(port, () => { console.log(`Started server on port ${port}`); });