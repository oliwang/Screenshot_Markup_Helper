var captured;
var btn_status = "play";
var is_init = true;




// debugger;

// https://stackoverflow.com/questions/31404776/add-and-remove-eventlistener-with-arguments-and-access-element-and-event-java

ElementInspector.prototype.appendOverlay = function() {
    var overlay = this.doc.createElement('div');
    overlay.setAttribute('id', 'element-inspector-overlay');
    overlay.setAttribute('style', 'pointer-events: none; position: absolute; z-index: 1000000; background-color: ' + this.overlayBackgroundColor + ';');
    this.doc.body.appendChild(overlay);

    this.overlay = this.doc.querySelector('#element-inspector-overlay');
};

ElementInspector.prototype._init = function(){
    var that = this;
    that.appendOverlay();
    that.hideOverlay();
    

}


ElementInspector.prototype._startInspecting = function(){
    // alert("new startInspecting");
    var that = this;
    that.showOverlay();

    that.el.addEventListener('mousemove', mousemoveEvent = mousemoveEventContent.bind(that.el, that));
    that.el.addEventListener('click', clickEvent = clickEventContent.bind(that.el, that));
}

ElementInspector.prototype._stopInspecting = function(){
    // alert("new stopInspecting");
    var that = this;
    that.hideOverlay();

    that.el.removeEventListener('mousemove', mousemoveEvent);
    that.el.removeEventListener('click', clickEvent);
}



function mousemoveEventContent(that) {
    var e = event;
    if (that.clicked) {
        return;
    }

    if (e.target === that.currentTarget) {
        return;
    }

    ignore = [that.doc.body, that.doc.documentElement, that.doc];

    if (ignore.indexOf(e.target) > -1) {
        that.currentTarget = null;
        that.hideOverlay();
        return;
    }

    that.currentTarget = e.target;
   
    var offset = that._getOffset(e.target);
    var width = that._getOuterSize(e.target, 'Width');
    var height = that._getOuterSize(e.target, 'Height');

    if (that._isFunction(that.onMousemove)) {
        that.onMousemove(e);
    }

    that.setOverlayStyle(offset.top, offset.left, width, height);
    that.showOverlay();
}



function clickEventContent (that) {
    var e = event;
    if (that._isFunction(that.onClick)) {
        that.onClick(e);
    }
    that.clicked = !that.clicked;
    e.preventDefault();
    e.stopPropagation();
    return false;

}


var ei = new ElementInspector({
    targetSelector: 'body',
    onMousemove: function (e) {
        console.log("startMarkup onMousemove");
        captured = ei.overlay;
        // console.log(e.target.outerHTML);
    },
    onClick: function (e) {
        var markup = captured.cloneNode(true);
        markup.style.backgroundColor = 'rgba(255,255,0,0.3)';
        markup.classList.add("SA_markup");
        markup.style.position = 'absolute';
        document.body.appendChild(markup);
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request) {

        if (request.msg === 'remove_markup') {
            clearMarkup();
        } else if (request.msg === 'markup') {
            chrome.storage.sync.get("control_status", ({control_status}) => {
                if(control_status === "pause") {
                    chrome.storage.sync.set({ control_status: 'play' })
                    cs = 'play';
                    endMarkup();
                } else if (control_status === "play") {
                    chrome.storage.sync.set({ control_status: 'pause' });
                    cs = 'pause';
                    startMarkup();
                }

                if (request.data.sender == "popup") {
                    sendResponse({cs: cs});
                } else if (request.data.sender == "background") {
                    // content.js to popup.js send message
                    chrome.runtime.sendMessage({msg: "control_status", data: {cs: cs}});
                }
            });

        } 

    }

    return true;
});

function startMarkup() {
    // console.log("startMarkup");
    ei._startInspecting();
}

function endMarkup() {
    // console.log("endMarkup");
    ei._stopInspecting();

}

function clearMarkup() {
    var annotations = document.querySelectorAll(".SA_markup");
    for (var i = 0; i < annotations.length; i++) {
        document.body.removeChild(annotations[i]);
    }
}

