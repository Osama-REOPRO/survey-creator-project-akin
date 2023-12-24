let questionsList = document.getElementById('questions');
let surveyTitle = document.getElementById('survey-title');

function Question(question_text, answer_type = 'text') {
    this.question_text = question_text;
    this.answer_type = answer_type;
}

let questions = [];
let questionID = 0;

if (sessionStorage.getItem('editingSurvey') == 'true') {
    // editing survey
    var survey_id = sessionStorage.getItem('survey_id');
    $.get(`/surveyContents?survey_id=${survey_id}`, (data, status) => {
        console.log(data);
        surveyTitle.value = data.title;
        // questions = data.questions;
        console.log(questions);
        data.questions.forEach(q => {
            addQuestion(q.question, q.answer_type);
        });
    });
} else {
    // new survey
    addQuestion();
}

let createSurveyButton = document.getElementById('createSurveyButton').addEventListener('click', () => {
    console.log('create survey button clicked');
    let dataToSend;
    if (sessionStorage.getItem('editingSurvey') == 'true') {
        console.log('submitting survey edit');
        dataToSend = {
            survey_id: survey_id,
            username: sessionStorage.getItem('username'),
            surveyTitle: document.getElementById('survey-title').value,
            surveyQuestions: questions
        }
        $.post('/submitSurveyEdit', dataToSend, (data, status) => {
            console.log(`${data} and status is ${status}`);
        });
        // location.href = `/index?username=${sessionStorage.getItem('username')}`;
        location.href = `/survey?isCreator=true&creatorName=${sessionStorage.getItem('username')}&surveyid=${survey_id}`;
    } else {
        console.log('submitting new survey');
        dataToSend = {
            username: sessionStorage.getItem('username'),
            surveyTitle: document.getElementById('survey-title').value,
            surveyQuestions: questions
        }
        $.post('/submitSurvey', dataToSend, (data, status) => {
            console.log(`${data} and status is ${status}`);
        });
        location.href = `/index?username=${sessionStorage.getItem('username')}`;
    }
});


function addQuestion(question_text, answer_type) {
    let question = new Question;
    questions.push(question);
    console.log(questions);


    let li = document.createElement('li');
    let question_text_area = document.createElement('textarea');
    question_text_area.addEventListener('change', () => {
        console.log('question text changed');
        question.question_text = question_text_area.value
    });
    question_text_area.placeholder = 'Question';
    question_text_area.setAttribute('style', 'vertical-align:top; resize: vertical;');
    question_text_area.setAttribute('rows', 2);
    question_text_area.setAttribute('cols', 70);
    question_text_area.setAttribute('oninput', 'this.style.height = ""; this.style.height = this.scrollHeight + "px"');
    if (question_text != undefined) {
        question_text_area.value = question_text;
        question.question_text = question_text_area.value;
    }
    li.appendChild(question_text_area);

    li.appendChild(document.createElement('br'));

    let text_answer_radio = document.createElement('input');
    text_answer_radio.setAttribute('type', 'radio');
    text_answer_radio.setAttribute('name', 'answerType' + questionID);
    if (answer_type == null || answer_type == 'text') {
        text_answer_radio.setAttribute('checked', 'checked');
        question.answer_type = 'text';
    }
    text_answer_radio.addEventListener('change', () => {
        console.log('text type chosen');
        question.answer_type = 'text';
    });
    li.appendChild(text_answer_radio);

    let text_answer_label = document.createElement('label');
    text_answer_label.textContent = ' text answer';
    li.appendChild(text_answer_label);

    let yes_no_answer_radio = document.createElement('input');
    yes_no_answer_radio.setAttribute('type', 'radio');
    yes_no_answer_radio.setAttribute('name', 'answerType' + questionID);
    if (answer_type == 'yes-no') {
        yes_no_answer_radio.setAttribute('checked', 'checked');
        question.answer_type = 'yes-no';
    }
    yes_no_answer_radio.addEventListener('change', () => {
        console.log('yes/no type chosen');
        question.answer_type = 'yes-no';
    });
    li.appendChild(yes_no_answer_radio);

    let yes_no_answer_label = document.createElement('label');
    yes_no_answer_label.textContent = ' yes/no answer';
    li.appendChild(yes_no_answer_label);

    li.appendChild(document.createElement('br'));

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Question';
    deleteButton.addEventListener('click', () => {
        console.log('delete button clicked');
        questions = questions.filter((el) => { return el != question });
        li.remove();
    });
    li.appendChild(deleteButton);

    li.appendChild(document.createElement('br'));
    li.appendChild(document.createElement('br'));

    questionsList.appendChild(li);
    questionID++;
}