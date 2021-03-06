let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_AddHeading = document.getElementById("btn_AddTitle");
let btn_AddDesc = document.getElementById("btn_AddText");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");
let btn_DownloadDocx = document.getElementById("btn_DownloadDocx");
let btn_ImportJSON = document.getElementById("btn_ImportJSON");
let btn_ExportJSON = document.getElementById("btn_ExportJSON");
let div_steps_wrapper = document.getElementById("steps_wrapper");


function decodeQuote(str) {
    return str.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

function encodeQuote(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}


function add_item_to_wrapper(item_id, item_content) {
    var str_content = "";

    switch (item_content.type) {
        case "screenshot":
            var str_screenshot_template = `<img id="img_${item_id}" data-id="${item_id}" src="${item_content.src}">`;
            str_content = str_screenshot_template;
            break;
        case "heading":
            var str_title_template = `<input id="input_${item_id}" data-id="${item_id}" class="uk-input" type="text" placeholder="Please enter heading here" value="${item_content.value}" style="font-weight:bold;">`;
            str_content = str_title_template;
            break;
        case "desc":
            var str_desc_template = `<textarea id="textarea_${item_id}" data-id="${item_id}" class="uk-textarea" rows="3" placeholder="Please enter descriptions here">${item_content.value}</textarea>`;
            str_content = str_desc_template;
            break;
        default:
            console.log("default");
            break;
    }

    var str_card_template = `
        <div class="uk-card uk-card-default uk-card-body steps_array_card">
            <span class="uk-sortable-handle uk-margin-small-right uk-text-left" uk-icon="icon: table"></span>
            ${str_content}
            <span id="delete_${item_id}" data-id="${item_id}" class="uk-text-right uk-margin-small-left" uk-icon="icon: trash"></span>
        </div>
    `;

    var new_li = document.createElement("li");
    new_li.innerHTML = str_card_template;
    new_li.setAttribute('data-id', item_id);
    new_li.id = `li_${item_id}`;

    div_steps_wrapper.appendChild(new_li);
    document.getElementById(`li_${item_id}`).scrollIntoView();


    var delete_btn = document.querySelector(`#delete_${item_id}`);

    delete_btn.addEventListener("click", function (e) {
        var id = delete_btn.getAttribute("data-id");
        // console.log("id", id);

        div_steps_wrapper.removeChild(document.getElementById(`li_${id}`));

        chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
            var data_dict = result.data_dict;
            var steps_array = result.steps_array;

            delete data_dict[id];

            const index = steps_array.indexOf(id);
            if (index > -1) {
                steps_array.splice(index, 1);
            }

            chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });
        });

    });

    switch (item_content.type) {
        case "screenshot":
            document.querySelector(`#img_${item_id}`).addEventListener("load", function (e) {
                var src = e.target.src;
                var nWidth = e.target.naturalWidth;
                var nHeight = e.target.naturalHeight;

                chrome.storage.local.get('data_dict', function (data) {
                    var data_dict = data.data_dict;

                    for (const [key, value] of Object.entries(data_dict)) {
                        if (value.src == src) {
                            value["w"] = nWidth;
                            value["h"] = nHeight;
                            break;
                        }
                    }

                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });

            document.querySelector(`#img_${item_id}`).addEventListener("click", function (e) {
                var src = e.target.src;

                var filename = new Date().toISOString()
                filename = filename.replace(/[-:.TZ]/g, '');

                var anchor = document.createElement("a");
                anchor.href = src;
                anchor.download = filename + "_" + "screenshot.png";
                anchor.click();
            });

            break;
        case "heading":

            document.querySelector(`#input_${item_id}`).addEventListener("input", function (e) {
                var text = encodeQuote(e.target.value);
                var id = e.target.dataset.id;

                chrome.storage.local.get('data_dict', function (data) {
                    var data_dict = data.data_dict;

                    for (const [key, value] of Object.entries(data_dict)) {
                        if (key == id) {
                            value["value"] = text;
                            break;
                        }
                    }

                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });

            document.querySelector(`#input_${item_id}`).focus();

            break;
        case "desc":
            document.querySelector(`#textarea_${item_id}`).addEventListener("input", function (e) {
                var text = e.target.value;
                var id = e.target.dataset.id;

                chrome.storage.local.get('data_dict', function (data) {
                    var data_dict = data.data_dict;

                    for (const [key, value] of Object.entries(data_dict)) {
                        if (key == id) {
                            value["value"] = text;
                            break;
                        }
                    }

                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });

            document.querySelector(`#textarea_${item_id}`).focus();

            break;
        default:
            console.log("default");
            break;

    }



}


(function () {
    // alert("init");

    window.setTimeout(() => {
        console.log("scroll down")
        document.querySelector("#footer").scrollIntoView({ behavior: "smooth" });

    }, 300);

    chrome.storage.sync.get("control_status", ({ control_status }) => {
        setControlBtnStatus(control_status);
    });

    chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        steps_array.forEach(obj_id => {
            add_item_to_wrapper(obj_id, data_dict[obj_id]);
        });


    });

    UIkit.util.on('#steps_wrapper', 'moved', function (item) {

        var li_array = document.querySelectorAll("#steps_wrapper>li");

        var steps_array = [];

        li_array.forEach(li => {
            steps_array.push(li.getAttribute("data-id"));
        });

        chrome.storage.local.set({ "steps_array": steps_array });
    });

})();

function setControlBtnStatus(control_status) {
    btn_ControlAnnotation.classList = [];
    btn_ControlAnnotation.classList.add(control_status);

    btn_ControlAnnotation_i.classList = ["fas"];
    btn_ControlAnnotation_i.classList.add("fa-" + control_status);
}

function generateTimestampFilename() {
    var filename = new Date().toISOString()
    filename = filename.replace(/[-:.TZ]/g, '');
    return filename;
}

function takeScreenshot(windowId, tabId) {
    // alert("takeScreenshot")
    chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
        // console.log(dataUrl);

        // var anchor = document.createElement("a");
        // anchor.href = dataUrl;
        // anchor.download = filename + "_" + "screenshot.png";
        // anchor.click();

        chrome.tabs.sendMessage(tabId, { msg: 'crop', data: { sender: "popup", dataUrl: dataUrl } }, function (response) { });

    });
}




btn_Screenshot.addEventListener("click", async () => {
    console.log("clicked on screenshot_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    takeScreenshot(tab.windowId, tab.id);
});

btn_ControlAnnotation.addEventListener("click", async () => {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { msg: 'markup', data: { sender: "popup" } }, function (response) {
        console.log(response);
        setControlBtnStatus(response.cs);
    });

});



btn_ClearAnnotation.addEventListener("click", async () => {
    // alert("clicked on clear_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { msg: "remove_markup" });

});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.msg === "control_status") {
            setControlBtnStatus(request.data.cs);
        } else {
            console.log(request.msg);
        }
    }
);

btn_DownloadDocx.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tab.id, { msg: "download_docx" });
});

btn_RemoveAllImages.addEventListener("click", async () => {
    // let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // chrome.tabs.sendMessage(tab.id, { msg: "remove_all_images" });
    div_steps_wrapper.innerHTML = "";
    var steps_array = [];
    var data_dict = {};
    chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });
});

btn_AddHeading.addEventListener("click", async () => {
    var obj_id = "heading_" + generateTimestampFilename();
    var obj = {};
    obj["type"] = "heading";
    obj["value"] = "";

    chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        data_dict[obj_id] = obj;
        steps_array.push(obj_id);

        chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });

        add_item_to_wrapper(obj_id, obj);
    });

});

btn_AddDesc.addEventListener("click", async () => {
    var obj_id = "desc_" + generateTimestampFilename();
    var obj = {};
    obj["type"] = "desc";
    obj["value"] = "";


    chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        data_dict[obj_id] = obj;
        steps_array.push(obj_id);

        chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });

        add_item_to_wrapper(obj_id, obj);
    });

});

btn_ImportJSON.addEventListener("click", ()=>{
    document.querySelector("#file-input").click();

});

// https://usefulangle.com/post/193/javascript-read-local-file
document.querySelector("#file-input").addEventListener('change', function() {
	// files that user has chosen
	var all_files = this.files;
	if(all_files.length == 0) {
		alert('Error : No file selected');
		return;
	}

	// first file selected by user
	var file = all_files[0];

	// files types allowed
	var allowed_types = [ 'application/json', 'text/json', 'text/plain' ];
	if(allowed_types.indexOf(file.type) == -1) {
		alert('Error : Incorrect file type');
		return;
	}

	// Max 2 MB allowed
	// var max_size_allowed = 2*1024*1024
	// if(file.size > max_size_allowed) {
	// 	alert('Error : Exceeded size 2MB');
	// 	return;
	// }

	// file validation is successfull
	// we will now read the file

	var reader = new FileReader();

	// file reading started
	// reader.addEventListener('loadstart', function() {
	//     document.querySelector("#file-input-label").style.display = 'none'; 
	// });

	// file reading finished successfully
	reader.addEventListener('load', function(e) {
	    var text = e.target.result;
        console.log(text)

        var data = JSON.parse(text);

        var data_dict = data.data_dict;
        var steps_array = data.steps_array;

        chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });

        window.location.reload();

	    // contents of the file
	    // document.querySelector("#contents").innerHTML = text;
	    // document.querySelector("#contents").style.display = 'block';

	    // document.querySelector("#file-input-label").style.display = 'block'; 
	});

	// file reading failed
	reader.addEventListener('error', function() {
	    alert('Error : Failed to read file');
	});

	// file read progress 
	// reader.addEventListener('progress', function(e) {
	//     if(e.lengthComputable == true) {
	//     	document.querySelector("#file-progress-percent").innerHTML = Math.floor((e.loaded/e.total)*100);
	//     	document.querySelector("#file-progress-percent").style.display = 'block';
	//     }
	// });

	// read as text file
	reader.readAsText(file);
});

btn_ExportJSON.addEventListener("click", ()=>{
    chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        var fileName = generateTimestampFilename() + '.json';
        
        // Create a blob of the data
        var fileToSave = new Blob([JSON.stringify(result)], {
            type: 'application/json'
        });
        
        // Save the file
        saveAs(fileToSave, fileName);
    })

});






