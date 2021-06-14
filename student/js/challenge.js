let courseIDInput = document.getElementById('courseID');
let userTokenInput = document.getElementById('userToken');

window.onload = function(e) {
    console.log("loaded");
    chrome.storage.local.get(null, (data) => {
        courseIDInput.value = data.CourseID;
        userTokenInput.value = data.UserToken;
    });
}