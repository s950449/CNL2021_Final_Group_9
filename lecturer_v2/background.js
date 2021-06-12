var courseList = [{courseID:"77af8105_1d36_44ca_b434_cb412e10af3c",name:"math",masterToken:"b601be6d-a1a5-4001-a34a-b39c388319d0"}];
//var courseList = [];

let courseID = '';
let userToken = 'default user token';

let serverAddress = "http://127.0.0.1:8000";
//let serverAddress = "http://linux13.csie.ntu.edu.tw:8000";
//let serverAddress = "http://140.112.30.44:8000";
chrome.runtime.onInstalled.addListener(() => { 
  chrome.storage.sync.set({ "courseList":courseList });
  chrome.storage.sync.set({ "serverAddress":serverAddress } );
  chrome.storage.sync.set({ "courseID":courseID } );
  console.log('Default course is empty');
});