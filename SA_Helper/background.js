// background.js

let control_status = 'play';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ control_status });

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