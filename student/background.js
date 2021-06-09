let ServerAddress = 'seekrealthing.net';
let CourseID = 'default course token';
let CourseName = 'default course name';
let UserToken = 'default user token';
let UserName = 'default user name';
let InClass = 1;

let checkChallengeTimerName = 'CheckConnTimer';
let checkChallengeInterval = 0.1;

chrome.runtime.onInstalled.addListener(
    () => {
        chrome.storage.local.set({ 'ServerAddress':ServerAddress, 'CourseID':CourseID, 'UserToken':UserToken, 'InClass':InClass,
                                'UserName':UserName, 'CourseName':CourseName });
    }
);

chrome.tabs.onUpdated.addListener(function (tabI, changeInfo, tab) {
    console.log('onUpdated');
    if (changeInfo.url) {
        console.log(`onUpdated: URL has changed to ${changeInfo.url}`);
        onUrlChanged(changeInfo.url);
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log("onActivated");
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (activeInfo.tabId === tabId && changeInfo.url) {
            console.log(`onActivated.onUpdated: URL has changed to ${changeInfo.url}`);
            onUrlChanged(changeInfo.url);
        }
    })
});

chrome.alarms.create(
    checkChallengeTimerName, {
        delayInMinutes: checkChallengeInterval,
        periodInMinutes: checkChallengeInterval
    }
);

chrome.alarms.onAlarm.addListener( function(alram) {
    if (alram.name === checkChallengeTimerName)
        checkChallenge();
});

function checkChallenge() {
    chrome.storage.local.get("InClass", (data) => {
        if (data.InClass == 1)
            checkChallengeWithServer();
        else {
            console.log("not in class");
            return;
        }
    });
}

function setStorages() {
    chrome.storage.local.set({ 'ServerAddress':ServerAddress, 'CourseID':CourseID, 'UserToken':UserToken, 'InClass':InClass,
                                'UserName':UserName, 'CourseName':CourseName });
}

function onUrlChanged(urlString) {
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
        updateName();
    }
}

function checkChallengeWithServer() {
    const url = "http://" + ServerAddress + "/checkChallenge";

    console.log("checkChallenge", url);

    const data = new FormData();
    data.append('studentToken', UserToken);
    data.append('courseID', CourseID);

    fetch( url, {
        method: 'POST',
        body: data,
        mode: 'cors'
    } )
    .then(response => {
        if (!response.ok)
            onConnectionLost();
        else
            response.json().then(data => {
                if ('hasChallenge' in data && data.hasChallenge === 1 && 'type' in data && 'timeout' in data)
                    challenge(data.type, data.timeout);
            });
    })
    .catch((error) => {
        console.error(error);
        onConnectionLost();
    })
}

function challenge(type, timeout) {
    console.log('type: ', type, 'timeout: ', timeout);
    // TODO: add challenge
    // chrome.runtime.sendMessage({msg: "Challenge"});
}

function onConnectionLost() {
    console.log("Connection lost");
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.scripting.executeScript({
            target: {tabId: tabs[0].id},
            files: ['js/lostConnectionAlert.js'],
        });
    });
}

function updateName() {
    const url = "http://" + ServerAddress + "/getName";

    console.log("udpateName", url);

    const data = new FormData();
    data.append('studentToken', UserToken);
    data.append('courseID', CourseID);

    fetch( url, {
        method: 'POST',
        body: data,
        mode: 'cors'
    } )
    .then(response => {
        if (!response.ok)
            onConnectionLost();
        else
            response.json().then(data => {
                if ('studentName' in data && 'courseName' in data) {
                    chrome.storage.local.set({ 'UserName':UserName, 'CourseName':CourseName });
                }
            });
    })
    .catch((error) => {
        console.error(error);
    })
}