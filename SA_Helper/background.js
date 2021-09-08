// background.js

let control_status = 'play';

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ control_status });
  
});