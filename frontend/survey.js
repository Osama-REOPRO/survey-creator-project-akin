let editSurveyBut = document.getElementById('editSurveyBut');
let copyShareLinkBut = document.getElementById('copyShareLinkBut');
let copiedAlert = document.getElementById('copiedAlert');


function editSurveyButClicked(survey_id) {
    console.log('editSurveyButClicked clicked', survey_id);
    sessionStorage.setItem('survey_id', survey_id);
    sessionStorage.setItem('editingSurvey', true);
    location.href=`/editSurvey?survey_id=${survey_id}`;
}

function copyShareLinkButtonClicked(link) {
    console.log('copyShareLinkButtonClicked clicked');
    // Copy the text inside the text field
    navigator.clipboard.writeText(link);

    // Alert the copied text
    copiedAlert.hidden = false;
}