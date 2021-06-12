import {sendServer} from './server.js';
import {mainTabAlert} from './utils.js';
import {mainTabConfirm} from './utils.js';
import {allFilled} from './utils.js';


var registerButton = document.getElementById('register_button');
registerButton.onclick = showDiv;
function showDiv(){
	//var newURL = "../captcha_test.html";
  	//chrome.tabs.create({ url: newURL });
	chrome.tabs.create({ url: '../html/newCourse.html' });
}

window.onload = loadCourses;


function loadCourses(){
	var courseText = document.getElementById("courses");
	chrome.storage.sync.get("courseList", ({ courseList }) => {
		for (let course of courseList) {
			var div = document.createElement("div");
			var startButton = document.createElement("button");
			startButton.addEventListener('click',async function(){
				await startCourse(course);
			});
			div.innerHTML = course.name;
			startButton.innerHTML = `start course`;
			var removeButton = document.createElement("button");
			removeButton.addEventListener('click', async function(){
				await removeCourse(course);
			});

			removeButton.innerHTML = `remove course<br>`;
			var startCourseForm = document.createElement("form");
			startCourseForm.id = `startCourseForm:${course.courseID}`;
			startCourseForm.innerHTML = `
			<label for="masterToken:${course.courseID}">Master Token:</label>
	  		<input type = "text" id="masterToken:${course.courseID}" value="${course.masterToken}" required><br>
	  		<label for="link:${course.courseID}">Course Link:</label>
	  		<input type = "text" id="link:${course.courseID}" required><br><br>`;

			div.appendChild(removeButton);
			div.appendChild(startButton);
			
			div.appendChild(startCourseForm);

			courseText.appendChild(div);

			//courseText.innerHTML += `<div id="${course.name}_course">${course.name}<button tag="${course.name}" class="startButton">Start course</button><br><div>\n`;
		}
	});
	var startButtons = document.querySelectorAll(".startButton");
	chrome.storage.sync.get("courseList",({courseList}) =>{
		for (var i = 0; i < startButtons.length; i++) {	
			startButtons[i].onclick = async function (){
				await startCourse(courseList.get(startButtons[i].tag));
			}
		}
	});
}

async function startCourse(course){
	if(allFilled(`startCourseForm:${course.courseID}`)){
		//mainTabAlert(`start course: ${course.name}`);
		let data = new FormData();
		let link = document.getElementById(`link:${course.courseID}`).value;
		let masterToken = document.getElementById(`masterToken:${course.courseID}`).value;
		data.append('courseID',course.courseID);
		data.append('masterToken',masterToken);
		data.append('link',link);
		let msg = await sendServer(data,"startCourse");
		alert('start Course return code: ' + msg.code);
		await msg.code;
		await msg.url;
		alert(msg.url);
		if("code" in msg && msg.code == 0 && "url" in msg ){
   			alert("Emai sent");
   			updateMasterToken(course,masterToken); // save masterToken
   			chrome.tabs.create({ url: masg.url });
		}else{
			mainTabAlert("Start course fail");
		}

	}else{
		mainTabAlert('Fill all the fields');
	}
}

function removeCourse(course){ //locally
	if(confirm(`Are you sure you want to remove course: ${course.name}?`)){
	   	chrome.storage.sync.get("courseList", ({ courseList }) => {
	   		for (var i = 0; i < courseList.length; i++) {
		   		if(courseList[i].courseID  === course.courseID){
		   			courseList.splice(i, 1);
		   			break;
	   			}
	   		}
	   		chrome.storage.sync.set({"courseList":courseList});
	    });
	    location.reload();		
	}
}

function updateMasterToken(course,masterToken){
	chrome.storage.sync.get("courseList", ({ courseList }) => {
		for (var i = 0; i < courseList.length; i++) {
	   		if(courseList[i].courseID  === course.courseID){
	   			courseList[i].masterToken = masterToken;
	   			break;
   			}
	   }
		chrome.storage.sync.set({"courseList":courseList});
	});
}



