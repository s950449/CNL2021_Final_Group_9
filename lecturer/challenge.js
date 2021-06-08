import { sendServer } from './server.js';
var challengeBotton = document.getElementById('challenge');
challengeBotton.onclick = function () {
    submit();
};

async function challenge_submit() {
    let masterToken = document.getElementById('masterToken').value;
    let courseID = document.getElementById('courseID').value;
    let type = document.getElementById('type').value;
    let target = document.getElementById('target').value;
    let time = document.getElementById('time').value;

    let formData = new FormData();

    formData.append("masterToken", masterToken);
    formData.append("courseID", courseID);
    formData.append("type", type);
    formData.append("target", target);
    formData.append("time", time);

    let responseMsg = sendServer(formData, "challenge");
    if (responseMsg.code == 0) {
        alert("challenge success");
        window.history.back();
    }
    else {
        alert("challenge failed, please try again");
    }
}

