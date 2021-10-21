let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");
let btn_DownloadDocx = document.getElementById("btn_DownloadDocx");
let div_steps_wrapper = document.getElementById("steps_wrapper");


function add_image_to_wrapper(img_url) {
    var new_img = document.createElement("img");
            new_img.src = img_url;
            new_img.style.width = "100%";
            var filename = new Date().toISOString()
            filename = filename.replace(/[-:.TZ]/g, '');
            new_img.id = "img_" + filename;
            new_img.style.padding = "10px 0";
            new_img.style.border = "1px solid #ccc";
            // console.log(new_img);
            div_steps_wrapper.appendChild(new_img);
            new_img.addEventListener("click", function(e) {
                // console.log(e.target);
                // console.log(e.target.src);
                var ele_id = e.target.id;
                var ele_src = e.target.src;
                div_steps_wrapper.removeChild(document.getElementById(ele_id));
                chrome.storage.local.get('imgs', function(imgs) {
                    var imgs_arr = imgs.imgs;
                    // var index_of_ele = imgs_arr.indexOf(ele_src);

                    for (var i = 0; i < imgs_arr.length; i++) {
                        if (Object.keys(imgs_arr[i])[0] == ele_src) {
                            imgs_arr.splice(i, 1);
                            break;
                        }
                    }

                    chrome.storage.local.set({"imgs": imgs_arr});
                    // chrome.storage.local.remove([imgs_arr]);
                })
            });

            new_img.addEventListener("load", function(e){
                // console.log(e.target.naturalWidth);
                // console.log(e.target.naturalHeight);
                // console.log(e.target.src)
                var src = e.target.src;
                var nWidth = e.target.naturalWidth;
                var nHeight = e.target.naturalHeight;

                chrome.storage.local.get('imgs', function(imgs) {
                    var imgs_arr = imgs.imgs;
                    // var index_of_ele = imgs_arr.indexOf(ele_src);

                    for (var i = 0; i < imgs_arr.length; i++) {
                        if (Object.keys(imgs_arr[i])[0] == src) {
                            imgs_arr[i][src] = {"w": nWidth, "h": nHeight};
                            break;
                        }
                    }

                    chrome.storage.local.set({"imgs": imgs_arr});
                    // chrome.storage.local.remove([imgs_arr]);
                })

                
                
            }) 

}

(function() {
    // alert("init");
    chrome.storage.sync.get("control_status", ({ control_status }) => {
        setControlBtnStatus(control_status);
    });

    chrome.storage.local.get('imgs', function(imgs) {
        // console.log("open popup");
        // console.log(imgs);
        var imgs_arr = imgs.imgs;
        for (var i = 0; i < imgs_arr.length; i++) {
            var obj = imgs_arr[i];
            Object.keys(obj).forEach(function(key) {
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
    chrome.tabs.captureVisibleTab(windowId, {format: "png"}, (dataUrl) => {
        // console.log(dataUrl);
        var filename = new Date().toISOString()
        filename = filename.replace(/[-:.TZ]/g, '');
        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = filename + "_" + "screenshot.png";
        anchor.click();

        chrome.storage.local.get('imgs', function(imgs) {
            // console.log(imgs.imgs);
            var imgs_arr = imgs.imgs;
            var obj = {};
            obj[dataUrl] = 0;
            imgs_arr.push(obj);
            chrome.storage.local.set({"imgs": imgs_arr});
            add_image_to_wrapper(dataUrl);
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
    
    chrome.tabs.sendMessage(tab.id, { msg: 'markup', data: {sender : "popup"} }, function(response){
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
    function(request, sender, sendResponse) {
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
    chrome.storage.local.set({imgs});
});






