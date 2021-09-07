// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

let screenshot_btn = document.getElementById("screenshot");



// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: setPageBackgroundColor,
    });
  });
  
  // The body of this function will be executed as a content script inside the
  // current page
  function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
      document.body.style.backgroundColor = color;
    });
  }

screenshot_btn.addEventListener("click", async () => {
    console.log("clicked on screenshot_btn");
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.tabs.captureVisibleTab(tab.windowId, {}, (dataUrl) => {
        console.log("taken");
        // alert(dataUrl);

        var anchor = document.createElement("a");
        anchor.href = dataUrl;
        anchor.download = "screenshot.png";
        anchor.click();

        // var url = dataUrl.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');
        // window.open(url);
    });

});