let courseIDInput = document.getElementById('courseID');
let courseNameInput = document.getElementById('courseName');
let userTokenInput = document.getElementById('userToken');
let userNameInput = document.getElementById('userName');
let serverAddressInput = document.getElementById('serverAddress');
let endCourseButton = document.getElementById('endClass');
let challengeDiv = document.getElementById('challengeDiv');

document.addEventListener('DOMContentLoaded', function(){
    document.forms['infoForm'].addEventListener('submit', formSubmitted);
});

endCourseButton.addEventListener('click', function(){
    InClass = 0;
    chrome.storage.local.set({ InClass });
});


window.onload = function(e) {
    chrome.storage.local.get(null, (data) => {
        courseIDInput.value = data.CourseID;
        courseNameInput.value = data.CourseName;
        userTokenInput.value = data.UserToken;
        userName.value = data.UserName;
        serverAddressInput.value = data.ServerAddress;
    });
}

function formSubmitted() {
    CourseID = courseIDInput.value;
    UserToken = userTokenInput.value;
    ServerAddress = serverAddressInput.value;

    chrome.storage.local.set({ 'CourseID':CourseID, 'UserToken':UserToken, 'ServerAddress':ServerAddress });
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log("onMessage");
        if (request.msg === "Challenge") {
            challengeDiv.style.display = "block";
        }
    }
);
