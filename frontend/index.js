console.log(`frontend script loaded`);

function onload(username){
    sessionStorage.setItem('username', username);
}
function createSurvey(username){
    console.log(`creating survey! ${username}`);
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('editingSurvey', false);
}

function deleteSurvey(id){
    console.log(id);
    let dataToSend = {
        survey_id: id
    }
    $.post('/deleteSurvey', dataToSend, (data, status) => {
        console.log(`${data} and status is ${status}`);
        if(status == 'success'){
            location.reload();
        }
    })
}