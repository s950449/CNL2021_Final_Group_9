import {sendServer} from './server.js';
import {mainTabAlert} from './utils.js';
var endButton = document.getElementById('end_button');
endButton.onclick = end;


var challengeButton = document.getElementById('challenge_button');
challengeButton.onclick = challenge;

var infoButton = document.getElementById('info_button');
infoButton.onclick = requestInfo;

async function end(){
   chrome.storage.sync.get("courseID",({courseID})=>{
      chrome.storage.sync.get("courseList",async ({courseList})=>{
         var i;
         var course;
         for (i = 0; i < courseList.length; i++) {
            if(courseList[i].courseID  === courseID){
               course = courseList[i];
               break;
            }
         }
         if(i == courseList.length){
            mainTabAlert("end course fail");
            return;
         }
         let formdata = new FormData();
         //master token possibly parse url;
         //let masterToken = document.getElementById(`masterToken:${course.courseID}`).value;
         formdata.append('courseID',course.courseID);
         formdata.append('masterToken',course.masterToken);
         let msg = await sendServer(formdata,"endCourse");
         if("code" in msg && msg.code == 0){
            alert("end course success");
            location.replace('../html/popup.html');  
         }else{
            mainTabAlert("end course fail");
         }
      })
   });
}


async function challenge(){
   chrome.storage.sync.get("courseID",({courseID})=>{
      chrome.storage.sync.get("courseList",async({courseList})=>{
         var i;
         var course;
         for (i = 0; i < courseList.length; i++) {
            if(courseList[i].courseID  === courseID){
               course = courseList[i];
               break;
            }
         }
         if(i == courseList.length){
            mainTabAlert("challenge fail");
            return;
         }

         let formdata = new FormData();
         let type = $("input[type='radio'][name='challengeType']:checked").val();
         let target = $("input[type='radio'][name='targetType']:checked").val();
         let time = $("input[type='radio'][name='timeType']:checked").val();
         formdata.append('courseID',course.courseID);
         formdata.append('masterToken',course.masterToken);
         formdata.append('target',target);
         formdata.append('type',type);
         formdata.append('time',time);

         let msg = await sendServer(formdata,"challenge");
         if("code" in msg && msg.code == 0){
            mainTabAlert("challenge sent");
         }else{
            mainTabAlert("challenge sent fail");
         }
      })
   });
}


async function requestInfo(){
   chrome.storage.sync.get("courseID",({courseID})=>{
      chrome.storage.sync.get("courseList",async({courseList})=>{
         var i;
         var course;
         for (i = 0; i < courseList.length; i++) {
            if(courseList[i].courseID  === courseID){
               course = courseList[i];
               break;
            }
         }
         if(i == courseList.length){
            mainTabAlert("request info fail");
            return;
         }

         let formdata = new FormData();
         let type = $("input[type='radio'][name='challengeType']:checked").val();
         formdata.append('courseID',course.courseID);
         formdata.append('masterToken',course.masterToken);
         formdata.append('type',type);

         let responseMsg = await sendServer(formdata,"requestInfo");
         if("code" in responseMsg && responseMsg.code == 0){
            mainTabAlert("request info sent");
            //displayInfo(responseMsg.Info);
         }else{
            mainTabAlert("request info fail");
         }
      })
   });
}