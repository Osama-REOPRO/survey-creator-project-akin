let editSurveyBut = document.getElementById('editSurveyBut');
let copyShareLinkBut = document.getElementById('copyShareLinkBut');
let copiedAlert = document.getElementById('copiedAlert');
let submittedText = document.getElementById('submittedText');

function onload(questions) {
    // var questionssdf = questions;
    // console.log('onload', questionssdf);
}

function editSurveyButClicked(survey_id) {
    console.log('editSurveyButClicked clicked', survey_id);
    sessionStorage.setItem('survey_id', survey_id);
    sessionStorage.setItem('editingSurvey', true);
    location.href = `/editSurvey?survey_id=${survey_id}`;
}

function copyShareLinkButtonClicked(link) {
    console.log('copyShareLinkButtonClicked clicked');
    // Copy the text inside the text field
    navigator.clipboard.writeText(link);

    // Alert the copied text
    copiedAlert.hidden = false;
}

let submitAnswersButton = document.getElementById('submitAnswersButton');
let taker_name;
function onTakerNameChanged(name) {
    taker_name = name;
    sessionStorage.setItem('taker_name', taker_name);
    submitAnswersButton.disabled = false;
}

function Answer(id, answer) {
    this.id = id;
    this.answer = answer;
}
let answers = [];
function addAnswer(id, answer) {
    console.log('adding answer: id=', id, 'answer=', answer);
    answers = answers.filter((ans) => { return ans.id != id });
    answers.push(new Answer(id, answer));
}
let taker_id = sessionStorage.getItem('taker_id');
function submitAnswerButClicked(survey_id) {
    console.log('submitAnswerButClicked');
    let dataToSend = {
        taker_id: taker_id,
        taker_name: taker_name,
        answers: answers
    }
    $.post(`/submitAnswers`, dataToSend, (data) => {
        console.log('/submitAnswers', data);
        taker_id = data.taker_id;
        sessionStorage.setItem('taker_id', taker_id);
        submittedText.hidden = false;
        setTimeout(() => { submittedText.hidden = true; }, 1000);
    });
}