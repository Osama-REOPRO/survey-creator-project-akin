console.log(`frontend script loaded`);

function createSurvey(username){
    console.log(`creating survey! ${username}`);
    sessionStorage.setItem('username', username);
}