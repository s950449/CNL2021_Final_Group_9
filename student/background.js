let ServerAddress = 'seekrealthing.net';
let CourseID = 'default course token';
let CourseName = 'default course name';
let UserToken = 'default user token';
let UserName = 'default user name';
let ChallengeID = 'challengeID';
let InClass = 0;
const checkChallengeInterval = 10000;

const protocol = 'https://'

chrome.runtime.onInstalled.addListener(
    () => {
        chrome.storage.local.set({ 'ServerAddress':ServerAddress, 'CourseID':CourseID, 'UserToken':UserToken, 'InClass':InClass,
                                'UserName':UserName, 'CourseName':CourseName });
    }
);

chrome.tabs.onUpdated.addListener(function (tabI, changeInfo, tab) {
    console.log('onUpdated');
    if (changeInfo.url)
        onUrlChanged(changeInfo.url);
});

window.setInterval(function(){
    updateSyncValue();
    checkChallengeWithServer();
}, checkChallengeInterval);

function checkChallengeWithServer() {
    chrome.storage.local.get("InClass", (data) => {
        if (data.InClass == 1)
            checkChallenge();
        else {
            console.log("not in class");
            return;
        }
    });
}

function onUrlChanged(urlString) {
    console.log(`onUpdated: URL has changed to ${urlString}`);

    url = new URL(urlString);
    tmpCourseID = url.searchParams.get('courseID');
    tmpUserToken = url.searchParams.get('userToken');
    tmpServerAddress = url.searchParams.get('serverAddress');

    if (tmpCourseID != null && tmpUserToken != null) {
        CourseID = tmpCourseID;
        UserToken = tmpUserToken;
        InClass = 1;
        if (tmpServerAddress != null)
            ServerAddress = tmpServerAddress;
        chrome.storage.local.set({ 'ServerAddress':ServerAddress, 'CourseID':CourseID, 'UserToken':UserToken, 'InClass':InClass });
        getName();
    }
}

function updateSyncValue() {
    chrome.storage.local.get(null, (data) => {
        ServerAddress = data.ServerAddress;
        CourseID = data.CourseID;
        CourseName = data.CourseName;
        UserToken = data.UserToken;
        UserName = data.UserName;
        InClass = data.InClass;
    });
}

function postToServer(url, data, timeout=5000) {
    // https://stackoverflow.com/questions/46946380/fetch-api-request-timeout/50101022
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    return fetch(
        url, { method: 'POST', body: data, mode: 'cors', signal: controller.signal }
    )
}

function onConnectionLost() {
    console.log("Connection lost");
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.executeScript(tabs[0].id, { file: "./js/lostConnectionAlert.js" })
    });
}

function checkChallenge() {
    const url = protocol + ServerAddress + "/checkChallenge";
    console.log("checkChallenge", url);

    const data = new FormData();
    data.append('studentToken', UserToken);
    data.append('courseID', CourseID);

    postToServer(url, data, 5000)
    .then(response => {
        if (!response.ok)
            onConnectionLost();
        else
            response.json().then(data => {
                if ('hasChallenge' in data && data.hasChallenge === 1 && 'type' in data && 'timeout' in data && 'challengeID' in data)
                    challenge(data.type, data.timeout, data.challengeID);
            });
    })
    .catch((error) => {
        console.error(error);
        onConnectionLost();
    })
}

function getName() {
    const url = protocol + ServerAddress + "/getName";

    console.log("udpateName", url);

    const data = new FormData();
    data.append('studentToken', UserToken);
    data.append('courseID', CourseID);

    postToServer(url, data, 5000)
    .then(response => {
        if (!response.ok)
            onConnectionLost();
        else
            response.json().then(data => {
                if ('studentName' in data && 'courseName' in data)
                    chrome.storage.local.set({ 'UserName':data.studentName, 'CourseName':data.courseName });
            });
    })
    .catch((error) => {
        console.error(error);
    })
}

function challenge(type, timeout, challengeID) {
    console.log('type: ', type, 'timeout: ', timeout);
    const url = protocol + ServerAddress + "/acceptChallenge";
    chrome.windows.create({url: url, type: 'popup', width:500, height:250}, function(newWindow) {
        chrome.storage.local.set({ 'ChallengeID':challengeID }, function() {
            chrome.tabs.executeScript(newWindow.tabs[0].id, { file: "./js/challenge.js" })
            setTimeout(function(){
                chrome.windows.remove(newWindow.id);
            }, timeout*1000);
        });
    });
}