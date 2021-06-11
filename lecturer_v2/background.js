var courseList = [{courseID:"1",name:"math",masterToken:"777"}];

let courseID = '';
let userToken = 'default user token';

let serverAddress = "http://linux13.csie.ntu.edu.tw:8000";
//let serverAddress = "http://140.112.30.44:8000";
chrome.runtime.onInstalled.addListener(() => { 
  chrome.storage.sync.set({ "courseList":courseList });
  chrome.storage.sync.set({ "serverAddress":serverAddress } );
  chrome.storage.sync.set({ "courseID":courseID } );
  console.log('Default course is empty');
});