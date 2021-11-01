// background.js

let control_status = 'play';
let imgs = [];
let steps_array = [];
let data_dict = {};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ control_status });
    chrome.storage.local.set({ imgs });
    chrome.storage.local.set({ steps_array });
    chrome.storage.local.set({ data_dict });

});



function takeScreenshot(windowId) {
    chrome.tabs.captureVisibleTab(windowId, {format: 'png'}, (dataUrl) => {
        console.log("taken");
        var filename = new Date().toISOString()
        filename = filename.replace(/[-:.TZ]/g, '');
        chrome.downloads.download({
            url: dataUrl,
            filename: filename + "_" + "screenshot.png"
        });

        chrome.storage.local.get('imgs', function(imgs) {
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

    });
}


chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        console.log("tabs", tabs);

        if (command === 'take_screenshot') {
            takeScreenshot(tabs[0].windowId);
        } else if (command === 'markup') {
            chrome.tabs.sendMessage(tabs[0].id, {msg:command, data: {sender : "background"}});
        } else {
            chrome.tabs.sendMessage(tabs[0].id, { msg: command });

        }
        
        
    });
});