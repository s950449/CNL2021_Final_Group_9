import {sendServer} from './server.js';
import {mainTabAlert} from './utils.js';
import {mainTabConfirm} from './utils.js';

var registerButton = document.getElementById('register_button');
registerButton.onclick = function(){
   showDiv();
};
function showDiv(){
	chrome.tabs.create({ url: 'newCourse.html' });
	//document.getElementById('newCourseDiv').style.display = "block";
}

window.onload = function() {
    loadCourses();
}

function loadCourses(){
	var courseText = document.getElementById("courses");
	chrome.storage.sync.get("courseList", ({ courseList }) => {
		for (let course of courseList) {
			var div = document.createElement("div");
			var startButton = document.createElement("button");
			startButton.addEventListener('click',function(){
				startCourse(course);
			});
			div.innerHTML = course.name;
			div.appendChild(startButton);
			startButton.innerHTML = `start course`;
			var removeButton = document.createElement("button");
			removeButton.addEventListener('click',function(){
				removeCourse(course);
			});
			div.appendChild(removeButton);
			removeButton.innerHTML = `remove course<br>`;
			courseText.appendChild(div);

			//courseText.innerHTML += `<div id="${course.name}_course">${course.name}<button tag="${course.name}" class="startButton">Start course</button><br><div>\n`;
		}
	});
	var startButtons = document.querySelectorAll(".startButton");
	chrome.storage.sync.get("courseList",({courseList}) =>{
		for (var i = 0; i < startButtons.length; i++) {	
			startButtons[i].onclick = function (){
				startCourse(courseList.get(startButtons[i].tag));
			}
		}
	});
}

function startCourse(course){
	mainTabAlert(`start course: ${course.name}`);
	let courseData = new FormData();
	courseData.append('token',course.token);
	let msg = sendServer(courseData,"startCourse");
}

function removeCourse(course){
	if(confirm(`Are you sure you want to remove course: ${course.name}?`)){
	   	chrome.storage.sync.get("courseList", ({ courseList }) => {
	   		for (var i = 0; i < courseList.length; i++) {
		   		if(courseList[i].token  === course.token){
		   			courseList.splice(i, 1);
		   			break;
	   			}
	   		}
	   		chrome.storage.sync.set({"courseList":courseList});
	    });
	    location.reload();		
	}
}



