import express from "express"
import morgan from "morgan"
const app = express();
const port = 3000;
app.use(morgan("tiny"));

app.get("/", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/index.html"); });
app.get("/index.js", (req, res) => { res.sendFile("/home/osama/akin-mulakat/survey-creator-project-akin/index.js"); });

app.listen(port, () => { console.log(`Started server on port ${port}`); });