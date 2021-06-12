function onSubmit(token) {
         document.getElementById("demo-form").submit();
       }
        var xhr = new XMLHttpRequest(),
        doc = document;
        xhr.responseType = 'blob';
        xhr.open('GET', "https://www.google.com/recaptcha/api.js", true);
        xhr.onload = function () {

            var script = doc.createElement('script'),
            src = URL.createObjectURL(xhr.response);

            script.src = src;
            console.log(script);
            alert(JSON.stringify(script, 4));
            doc.body.appendChild(script);
        };
        xhr.send();