async function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, resolve);
    })
        .then(result => {
            if (key == null) return result;
            else return result[key];
        });
}

export async function sendServer(msg,action){
	//https://stackoverflow.com/questions/5587973/javascript-upload-file
	const ctrl = new AbortController()    // timeout
	setTimeout(() => ctrl.abort(), 3000);	
	let serverAddress = await getFromStorage("serverAddress");
	/*try {
		let r =  await fetch(`${serverAddress}/${action}`,
			{method: "POST", 
					body: msg, signal: ctrl.signal,mode: 'cors'
			});
		if(r.status != 200){
			alert("upload fail");
		}
		return await r.json();
    } catch(e) {
    	alert(e);
    	alert("server connection problem");
	}*/
	try {
		let r =  await makeRequest("POST",`${serverAddress}/${action}`,msg);
		return r;
    } catch(e) {
    	alert(e);
    	alert("server connection problem");
	}
	return {code:-2}; //fail
}


function makeRequest(method, url,msg) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.responseType = 'json';
        xhr.open(method, url);	
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function (err) {
        	alert(err);
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send(msg);
    });
}