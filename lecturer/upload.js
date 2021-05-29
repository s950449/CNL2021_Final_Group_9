alert(`in upload.js`)
var fileChooser = document.createElement('input');
fileChooser.type = 'file';
fileChooser.addEventListener('change', function () {
    var file = fileChooser.files[0];
    var formData = new FormData();
    formData.append(file.name, file);
    form.reset();   // <-- Resets the input so we do get a `change` event,
                    //     even if the user chooses the same file
});

/* Wrap it in a form for resetting */
var form = document.createElement('form');
form.appendChild(fileChooser);


fileChooser.click();