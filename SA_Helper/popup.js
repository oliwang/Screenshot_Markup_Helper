let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");
let btn_DownloadDocx = document.getElementById("btn_DownloadDocx");
let div_steps_wrapper = document.getElementById("steps_wrapper");


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

    chrome.storage.local.get('imgs', function (imgs) {
        // console.log("open popup");
        // console.log(imgs);
        var imgs_arr = imgs.imgs;
        for (var i = 0; i < imgs_arr.length; i++) {
            var obj = imgs_arr[i];
            Object.keys(obj).forEach(function (key) {
                // console.log(key);
                add_image_to_wrapper(key);
            });

        }

    });

})();

function setControlBtnStatus(control_status) {
    btn_ControlAnnotation.classList = [];
    btn_ControlAnnotation.classList.add(control_status);

    btn_ControlAnnotation_i.classList = ["fas"];
    btn_ControlAnnotation_i.classList.add("fa-" + control_status);
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

        chrome.storage.local.get('imgs', function (imgs) {
            // console.log(imgs.imgs);
            var imgs_arr = imgs.imgs;
            var is_dup = false;

            for (var i = 0; i < imgs_arr.length; i++) {
                if (Object.keys(imgs_arr[i])[0] == dataUrl) {
                    is_dup = true;
                    break;
                }
            }

            if (!is_dup) {
                var obj = {};
                obj[dataUrl] = {"w": 0, "h": 0, "text": ""};
                imgs_arr.push(obj);
                chrome.storage.local.set({ "imgs": imgs_arr });
                add_image_to_wrapper(dataUrl);
            }

            
        });

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
    var imgs = [];
    chrome.storage.local.set({ imgs });
});






