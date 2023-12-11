let questionsList = document.getElementById('questions');
let questionNum = 1;

function addQuestion() {
    questionNum++;
    let li = document.createElement('li');
    let in1 = document.createElement('textarea');
    in1.placeholder = 'Question';
    in1.setAttribute('style', 'vertical-align:top; resize: vertical;');
    in1.setAttribute('rows', 2);
    in1.setAttribute('cols', 70);
    in1.setAttribute('oninput', 'this.style.height = ""; this.style.height = this.scrollHeight + "px"');
    li.appendChild(in1);

    let br1 = document.createElement('br');
    li.appendChild(br1);

    let in2 = document.createElement('input');
    in2.setAttribute('type', 'radio');
    in2.setAttribute('name', 'answerType' + questionNum);
    in2.setAttribute('checked', 'checked');
    li.appendChild(in2);

    let in2label = document.createElement('label');
    in2label.textContent = ' text answer';
    li.appendChild(in2label);

    let in3 = document.createElement('input');
    in3.setAttribute('type', 'radio');
    in3.setAttribute('name', 'answerType' + questionNum);
    li.appendChild(in3);

    let in3label = document.createElement('label');
    in3label.textContent = ' yes/no answer';
    li.appendChild(in3label);

    let br2 = document.createElement('br');
    li.appendChild(br2);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Question';
    li.appendChild(deleteButton);

    let br3 = document.createElement('br');
    li.appendChild(br3);
    let br4 = document.createElement('br');
    li.appendChild(br4);

    questionsList.appendChild(li);
}