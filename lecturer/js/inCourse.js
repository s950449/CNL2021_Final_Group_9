import {sendServer} from './server.js';

var endButton = document.getElementById('end_button');
endButton.onclick = end;


var challengeButton = document.getElementById('challenge_button');
challengeButton.onclick = challenge;

async function end(){
   let course = {courseID:'111',masterToken:'000'};// fortest
   let data = new FormData();
   //master token possibly parse url;
   //let masterToken = document.getElementById(`masterToken:${course.courseID}`).value;
   data.append('courseID',course.courseID);
   data.append('masterToken',course.masterToken);
   let responseMsg = await sendServer(data,"endCourse");
   if(responseMsg.code == 0){
      alert("end course success");
      location.replace('../html/popup.html');  
   }else{
      mainTabAlert("end course fail");
   }
}


async function challenge(){
   let course = {courseID:'111',masterToken:'000'};// for test parse url later?
   let data = new FormData();
   let type = $("input[type='radio'][name='challengeType']:checked").val();
   let target = $("input[type='radio'][name='targetType']:checked").val();
   let time = $("input[type='radio'][name='timeType']:checked").val();
   data.append('courseID',course.courseID);
   data.append('masterToken',course.masterToken);
   data.append('target',target);
   data.append('type',type);
   data.append('time',time);

   let responseMsg = await sendServer(data,"challenge");
   if(responseMsg.code == 0){
      alert("challenge sent");
   }else{
      mainTabAlert("challenge sent fail");
   }
}