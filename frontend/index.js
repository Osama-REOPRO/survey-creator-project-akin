console.log(`frontend script loaded`);

function createSurvey(username){
    console.log(`creating survey! ${username}`);
    sessionStorage.setItem('username', username);
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