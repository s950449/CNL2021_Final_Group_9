let courseTokenInput = document.getElementById('courseToken');
let userTokenInput = document.getElementById('userToken');

document.addEventListener('DOMContentLoaded', function(){
    document.forms['infoForm'].addEventListener('submit', formSubmitted);
});

window.onload = function(e) {

    chrome.storage.sync.get("courseToken", (data) => {
        alert(data.courseToken);
        courseTokenInput.value = data.courseToken;
    });

    chrome.storage.sync.get("userToken", (data) => {
        alert(data.userToken);
        userTokenInput.value = data.userToken;
    });
}

function formSubmitted() {
    courseToken = courseTokenInput.value;
    userToken = userTokenInput.value;

    chrome.storage.sync.set({ courseToken });
    chrome.storage.sync.set({ userToken });

}

