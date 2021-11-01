let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_AddHeading = document.getElementById("btn_AddTitle");
let btn_AddDesc = document.getElementById("btn_AddText");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");
let btn_DownloadDocx = document.getElementById("btn_DownloadDocx");
let div_steps_wrapper = document.getElementById("steps_wrapper");




function add_item_to_wrapper(item_id, item_content) {
    var str_content = "";

    switch(item_content.type) {
        case "screenshot":
            var str_screenshot_template = `<img id="img_${item_id}" data-id="${item_id}" src="${item_content.src}">`;
            str_content = str_screenshot_template;
            console.log("screenshot");
            break;
        case "heading":
            var str_title_template = `<input id="input_${item_id}" data-id="${item_id}" class="uk-input" type="text" placeholder="Please enter a title here: " value="${item_content.value}">`;
            str_content = str_title_template;
            console.log("title");
            break;
        case "desc":
            var str_desc_template = `<textarea id="textarea_${item_id}" data-id="${item_id}" class="uk-textarea" rows="5" placeholder="Please enter descriptions here: ">${item_content.value}</textarea>`;
            str_content = str_desc_template;
            console.log("desc");
            break;
        default:
            console.log("default");
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
    new_li.setAttribute('data-id' , item_id);
    new_li.id = `#li_${item_id}`;

    div_steps_wrapper.appendChild(new_li);

    // chrome.storage.get('steps_array', function(steps){
    //     var steps_array = steps.steps_array;
    //     steps_array.push(item_id);
    //     chrome.storage.set({ "steps_array": steps_array });
    // });

    console.log(document.querySelector(`#delete_${item_id}`));

    var delete_btn = document.querySelector(`#delete_${item_id}`);
    
    delete_btn.addEventListener("click", function (e) {
        var id = delete_btn.getAttribute("data-id");;
        console.log(id);


        div_steps_wrapper.removeChild(document.getElementById(`#li_${item_id}`));

        chrome.storage.local.get('data_dict', function (data) {
            var data_dict = data.data_dict;

            delete data_dict[id];
            
            chrome.storage.local.set({ "data_dict": data_dict });
        })

        chrome.storage.local.get('steps_array', function(steps){
            var steps_array = steps.steps_array;
            const index = steps_array.indexOf(id);
            if (index > -1) {
                steps_array.splice(index, 1);
            }
            chrome.storage.local.set({ "steps_array": steps_array });
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
                        console.log(key, value);
                        if (value.src == src) {
                            value["w"] = nWidth;
                            value["h"] = nHeight;
                            break;
                        }
                    }
                    
                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });
            
            break;
        case "heading":

            document.querySelector(`#input_${item_id}`).addEventListener("input", function (e) {
                var text = e.target.value;
                var id = e.target.dataset.id;

                chrome.storage.local.get('data_dict', function (data) {
                    var data_dict = data.data_dict;

                    for (const [key, value] of Object.entries(data_dict)) {
                        console.log(key, value);
                        if (key == id) {
                            value["value"] = text;
                            break;
                        }
                    }
                    
                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });
            
            break;
        case "desc":
            document.querySelector(`#textarea_${item_id}`).addEventListener("input", function (e) {
                var text = e.target.value;
                var id = e.target.dataset.id;

                chrome.storage.local.get('data_dict', function (data) {
                    var data_dict = data.data_dict;

                    for (const [key, value] of Object.entries(data_dict)) {
                        console.log(key, value);
                        if (key == id) {
                            value["value"] = text;
                            break;
                        }
                    }
                    
                    chrome.storage.local.set({ "data_dict": data_dict });
                })
            });

            break;
        default:
            console.log("default");

    }



}

function add_image_to_wrapper(img_url) {
    var new_img = document.createElement("img");
    var new_input = document.createElement("input");
    new_img.src = img_url;
    new_img.style.width = "100%";
    var filename = new Date().toISOString()
    filename = filename.replace(/[-:.TZ]/g, '');
    new_img.id = "img_" + filename;
    new_img.style.margin = "5px 0 10px 0";
    new_img.style.border = "1px solid #ccc";
    // console.log(new_img);
    new_input.style.width = "100%";
    new_input.style.margin = "0px 0px";
    new_input.style.padding = "0px 0px";
    new_input.style.borderWidth = "1px";
    new_input.id = "input_" + filename;
    new_input.placeholder = "Enter step description text here:";

    div_steps_wrapper.appendChild(new_input);
    div_steps_wrapper.appendChild(new_img);

    chrome.storage.local.get('imgs', function (imgs) {
        var imgs_arr = imgs.imgs;

        for (var i = 0; i < imgs_arr.length; i++) {
            if (Object.keys(imgs_arr[i])[0] == img_url) {
                new_input.value = imgs_arr[i][img_url]["text"];
                break;
            }
        }

        chrome.storage.local.set({ "imgs": imgs_arr });
    })

    new_img.addEventListener("click", function (e) {
        // console.log(e.target);
        // console.log(e.target.src);
        var ele_id = e.target.id;
        var ele_input_id = e.target.id.replace("img_", "input_");
        var ele_src = e.target.src;
        div_steps_wrapper.removeChild(document.getElementById(ele_id));
        div_steps_wrapper.removeChild(document.getElementById(ele_input_id));
        chrome.storage.local.get('imgs', function (imgs) {
            var imgs_arr = imgs.imgs;

            for (var i = 0; i < imgs_arr.length; i++) {
                if (Object.keys(imgs_arr[i])[0] == ele_src) {
                    imgs_arr.splice(i, 1);
                    break;
                }
            }

            chrome.storage.local.set({ "imgs": imgs_arr });
        })
    });

    new_img.addEventListener("load", function (e) {

        var src = e.target.src;
        var nWidth = e.target.naturalWidth;
        var nHeight = e.target.naturalHeight;

        chrome.storage.local.get('imgs', function (imgs) {
            var imgs_arr = imgs.imgs;

            for (var i = 0; i < imgs_arr.length; i++) {
                if (Object.keys(imgs_arr[i])[0] == src) {
                    imgs_arr[i][src]["w"] = nWidth;
                    imgs_arr[i][src]["h"] = nHeight;
                    break;
                }
            }

            chrome.storage.local.set({ "imgs": imgs_arr });
        })

    });

    new_input.addEventListener("input", function (e) {
        var text = new_input.value;

        chrome.storage.local.get('imgs', function (imgs) {
            var imgs_arr = imgs.imgs;

            for (var i = 0; i < imgs_arr.length; i++) {
                if (Object.keys(imgs_arr[i])[0] == img_url) {
                    console.log("test found", imgs_arr[i][img_url]);
                    imgs_arr[i][img_url]["text"] = text;
                    break;
                }
            }
            console.log(imgs_arr);

            chrome.storage.local.set({ "imgs": imgs_arr });
        })
    });

}

(function () {
    // alert("init");
    chrome.storage.sync.get("control_status", ({ control_status }) => {
        setControlBtnStatus(control_status);
    });

    chrome.storage.local.get(["data_dict", "steps_array"], ( result ) => {
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        steps_array.forEach(obj_id => {
            add_item_to_wrapper(obj_id, data_dict[obj_id]);
        });
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

function takeScreenshot(windowId) {
    // alert("takeScreenshot")
    chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
        // console.log(dataUrl);
        var filename = new Date().toISOString()
        filename = filename.replace(/[-:.TZ]/g, '');
        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = filename + "_" + "screenshot.png";
        anchor.click();

        chrome.storage.local.get('data_dict', function (data) {
            var data_dict = data.data_dict;
            var is_dup = false;

            for (const [key, value] of Object.entries(data_dict)) {
                console.log(key, value);
                if (value.type == "screenshot" && value.src == dataUrl) {
                    is_dup = true;
                    break;
                }
            }

            if (!is_dup) {
                var obj = {};
                obj["type"] = "screenshot";
                obj["src"] = dataUrl;
                obj["w"] = 0;
                obj["h"] = 0;

                var obj_id = "screenshot_" + filename;

                data_dict[obj_id] = obj;
                
                chrome.storage.local.set({ "data_dict": data_dict });

                chrome.storage.local.get('steps_array', function (steps) {
                    var steps_array = steps.steps_array;
                    steps_array.push(obj_id);
                    chrome.storage.local.set({ "steps_array": steps_array });
                });

                add_item_to_wrapper(obj_id, obj);

            }



        });

        // chrome.storage.local.get('imgs', function (imgs) {
        //     // console.log(imgs.imgs);
        //     var imgs_arr = imgs.imgs;
        //     var is_dup = false;

        //     for (var i = 0; i < imgs_arr.length; i++) {
        //         if (Object.keys(imgs_arr[i])[0] == dataUrl) {
        //             is_dup = true;
        //             break;
        //         }
        //     }

        //     if (!is_dup) {
        //         var obj = {};
        //         obj[dataUrl] = {"w": 0, "h": 0, "text": ""};
        //         imgs_arr.push(obj);
        //         chrome.storage.local.set({ "imgs": imgs_arr });
        //         add_image_to_wrapper(dataUrl);
        //     }

        // });

        // window.close();

        // var url = dataUrl.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
        // window.open(url);
    });
}


btn_Screenshot.addEventListener("click", async () => {
    console.log("clicked on screenshot_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    takeScreenshot(tab.windowId);
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
            setControlBtnStatus(response.data.cs);
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
    chrome.storage.local.set({ steps_array });
});

btn_AddHeading.addEventListener("click", async () => { 
    var obj_id = "heading_" + generateTimestampFilename();
    var obj = {};
    obj["type"] = "heading";
    obj["value"] = "";

    chrome.storage.local.get('data_dict', function (data) {
        var data_dict = data.data_dict;
        data_dict[obj_id] = obj;
        chrome.storage.local.set({ "data_dict": data_dict });

        chrome.storage.local.get('steps_array', function (steps) {
            var steps_array = steps.steps_array;
            steps_array.push(obj_id);
            chrome.storage.local.set({ "steps_array": steps_array });

            // add to wrapper
            add_item_to_wrapper(obj_id, obj);
        });


    });

})

btn_AddDesc.addEventListener("click", async () => {
    var obj_id = "desc_" + generateTimestampFilename();
    var obj = {};
    obj["type"] = "desc";
    obj["value"] = "";

    chrome.storage.local.get('data_dict', function (data) {
        var data_dict = data.data_dict;
        data_dict[obj_id] = obj;
        chrome.storage.local.set({ "data_dict": data_dict });

        chrome.storage.local.get('steps_array', function (steps) {
            var steps_array = steps.steps_array;
            steps_array.push(obj_id);
            chrome.storage.local.set({ "steps_array": steps_array });

            // add to wrapper
            add_item_to_wrapper(obj_id, obj);
        });


    });

 })







