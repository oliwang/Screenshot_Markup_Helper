// background.js

let control_status = 'play';
let steps_array = [];
let data_dict = {};

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ control_status });
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

        chrome.storage.local.get(["data_dict", "steps_array"], ( result ) => {
            var data_dict = result.data_dict;
            var steps_array = result.steps_array;
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
                steps_array.push(obj_id);
                
                chrome.storage.local.set({ "data_dict": data_dict, "steps_array": steps_array });

                add_item_to_wrapper(obj_id, obj);

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