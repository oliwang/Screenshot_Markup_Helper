let btn_Screenshot = document.getElementById("btn_Screenshot");
let btn_ControlAnnotation = document.getElementById("btn_ControlAnnotation");
let btn_ControlAnnotation_i = document.querySelector("#btn_ControlAnnotation i");
let btn_ClearAnnotation = document.getElementById("btn_ClearAnnotation");





chrome.storage.sync.get("control_status", ({ control_status }) => {
    btn_ControlAnnotation.classList = [];
    btn_ControlAnnotation.classList.add(control_status);

    btn_ControlAnnotation_i.classList = ["fas"];
    btn_ControlAnnotation_i.classList.add("fa-" + control_status);

    
});


btn_Screenshot.addEventListener("click", async () => {
    console.log("clicked on screenshot_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.captureVisibleTab(tab.windowId, {}, (dataUrl) => {
        console.log("taken");
        // alert(tab.url);
        var filename = new Date().toISOString()
        filename = filename.replace(/[-:.TZ]/g, '');
        // alert(filename);
        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = filename + "_" + "screenshot.png";
        anchor.click();

        // var url = dataUrl.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
        // window.open(url);
    });

});

btn_ControlAnnotation.addEventListener("click", async () => {
    // alert(btn_ControlAnnotation.classList);
    // alert("clicked on control_btn");  
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.storage.sync.get("control_status", ({ control_status }) => {
        let cs = control_status;
        if (control_status == 'play') {
            chrome.storage.sync.set({ control_status: 'pause' });
            cs = 'pause';
            
            chrome.tabs.sendMessage(tab.id, { msg: "Start EI" });
            // chrome.scripting.executeScript({
            //     target: {tabId: tab.id},
            //     function: startMarkup,
            // });
        } else {
            chrome.storage.sync.set({ control_status: 'play' });
            cs = 'play';
            chrome.tabs.sendMessage(tab.id, { msg: "End EI" });
            // chrome.scripting.executeScript({
            //     target: {tabId: tab.id},
            //     function: endMarkup,
            // });
        }

        btn_ControlAnnotation.classList = [];
        btn_ControlAnnotation.classList.add(cs);

        btn_ControlAnnotation_i.classList = ["fas"];
        btn_ControlAnnotation_i.classList.add("fa-" + cs);
    });

});



btn_ClearAnnotation.addEventListener("click", async () => {
    // alert("clicked on clear_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: removeMarkup,
    });
});

function removeMarkup() {
    console.log("removeMarkup");
    var annotations = document.querySelectorAll(".SA_markup");
    for (var i = 0; i < annotations.length; i++) {
        document.body.removeChild(annotations[i]);
    }
}



