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