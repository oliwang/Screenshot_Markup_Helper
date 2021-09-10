let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");



function setControlBtnStatus(control_status) {
    btn_ControlAnnotation.classList = [];
    btn_ControlAnnotation.classList.add(control_status);

    btn_ControlAnnotation_i.classList = ["fas"];
    btn_ControlAnnotation_i.classList.add("fa-" + control_status);
}

chrome.storage.sync.get("control_status", ({ control_status }) => {
    setControlBtnStatus(control_status);
});

function takeScreenshot(windowId) {
    chrome.tabs.captureVisibleTab(windowId, {format: "png"}, (dataUrl) => {
        console.log("taken");
        var filename = new Date().toISOString()
        filename = filename.replace(/[-:.TZ]/g, '');
        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = filename + "_" + "screenshot.png";
        anchor.click();

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






