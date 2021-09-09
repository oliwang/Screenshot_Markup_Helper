// background.js

let control_status = 'play';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ control_status });

});



// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         files: ['element-inspector.js']
//     });
// });

chrome.commands.onCommand.addListener((command) => {
    console.log(`Command "${command}" triggered`);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        chrome.tabs.sendMessage(tabs[0].id, {action: command}, function(response) {});  
    });
});