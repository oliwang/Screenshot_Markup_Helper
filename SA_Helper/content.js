var captured;
var btn_status = "play";
var is_init = true;



// debugger;

// https://stackoverflow.com/questions/31404776/add-and-remove-eventlistener-with-arguments-and-access-element-and-event-java

ElementInspector.prototype.appendOverlay = function () {
    var overlay = this.doc.createElement('div');
    overlay.setAttribute('id', 'element-inspector-overlay');
    overlay.setAttribute('style', 'pointer-events: none; position: absolute; z-index: 1000000; background-color: ' + this.overlayBackgroundColor + ';');
    this.doc.body.appendChild(overlay);

    this.overlay = this.doc.querySelector('#element-inspector-overlay');
};

ElementInspector.prototype._init = function () {
    var that = this;
    that.appendOverlay();
    that.hideOverlay();


}


ElementInspector.prototype._startInspecting = function () {
    // alert("new startInspecting");
    var that = this;
    that.showOverlay();

    that.el.addEventListener('mousemove', mousemoveEvent = mousemoveEventContent.bind(that.el, that));
    that.el.addEventListener('click', clickEvent = clickEventContent.bind(that.el, that));
}

ElementInspector.prototype._stopInspecting = function () {
    // alert("new stopInspecting");
    var that = this;
    that.hideOverlay();

    that.el.removeEventListener('mousemove', mousemoveEvent);
    that.el.removeEventListener('click', clickEvent);
}



function mousemoveEventContent(that) {
    var e = event;
    if (that.clicked) {
        that.clicked = !that.clicked;
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



function clickEventContent(that) {
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
        markup.style.zIndex = '999';

        document.body.appendChild(markup);
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request) {

        if (request.msg === 'remove_markup') {
            clearMarkup();
        } else if (request.msg === 'markup') {
            chrome.storage.sync.get("control_status", ({ control_status }) => {
                if (control_status === "pause") {
                    chrome.storage.sync.set({ control_status: 'play' })
                    cs = 'play';
                    endMarkup();
                } else if (control_status === "play") {
                    chrome.storage.sync.set({ control_status: 'pause' });
                    cs = 'pause';
                    startMarkup();
                }

                if (request.data.sender == "popup") {
                    sendResponse({ cs: cs });
                } else if (request.data.sender == "background") {
                    // content.js to popup.js send message
                    chrome.runtime.sendMessage({ msg: "control_status", data: { cs: cs } });
                }
            });

        } else if (request.msg === 'download_docx') {
            downloadDocx();
        } else if (request.msg === 'crop') {
            console.log("content.js crop image", request.data.dataUrl);
            cropImage(request.data.sender, request.data.dataUrl);
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

function downloadDocx() {
    // alert("downloadDocx");

    var paragraphs = [];

    chrome.storage.local.get(["data_dict", "steps_array"], (result) => {
        // alert("get");
        var data_dict = result.data_dict;
        var steps_array = result.steps_array;

        paragraphs = new Array(steps_array.length).fill(null);

        steps_array.forEach(function (step, index) { 
            var obj_id = step;
            var obj = data_dict[obj_id];
            var curr_paragraph = new docx.Paragraph({});

            switch (obj.type) {
                case "screenshot":
                    var img_src = obj.src;
                    var w = obj.w;
                    var h = obj.h;

                    var curr_paragraph = new docx.Paragraph({
                        children: [
                            new docx.ImageRun({
                                data: img_src,
                                transformation: {
                                    width: 600,
                                    height: Math.floor(600 * h / w),
                                },
                                
                            }),
                            new docx.TextRun("\n"),
                        ],
                        spacing: {
                            after: 100
                        },
                    });


                    break;
                case "heading":

                    var text = obj.value;
                    // var numbering = obj.numbering;

                    var curr_paragraph = new docx.Paragraph({
                        text: text,
                        numbering: {
                            reference: "repro-steps-numbering",
                            level: 0,
                        },
                        heading: docx.HeadingLevel.HEADING_2,
                        spacing: {
                            before: 500,
                            after: 100
                        },
                        
                        

                    });


                    break;
                case "desc":
                    var text = obj.value;

                    var curr_paragraph = new docx.Paragraph({
                        children: [
                            new docx.TextRun(
                                {
                                    text: text + "\n",
                                    size: 24

                                }
                            ),
                        ],
                        spacing: {
                            after: 100
                        },
                    });

                    break;
                default:
                    console.log("default");
            }

            paragraphs[index] = curr_paragraph;

        });

        const doc = new docx.Document({
            numbering: {
                config: [
                    {
                        reference: "repro-steps-numbering",
                        levels: [
                            {
                                level: 0,
                                format: docx.LevelFormat.Decimal,
                                text: "%1.",
                                alignment: docx.AlignmentType.START,
                                
                            },
                        ],
                    },
                ],
            },
            sections: [
                {
                    properties: {},
                    children: paragraphs
                }
            ],
        })


        docx.Packer.toBlob(doc).then((blob) => {
            console.log(blob);
            var filename = new Date().toISOString()
            filename = filename.replace(/[-:.TZ]/g, '');
            saveAs(blob, "ReproSteps_" + filename + ".docx");
            console.log("Document created successfully");
        });

    });
}

function cropImage(sender, dataUrl) {
    
    var modal_html_str = 
    `<div id="crop-modal" class="uk-modal-full" uk-modal>
        <div class="uk-modal-dialog">
            <div class="uk-grid-collapse uk-flex-middle" uk-grid>
                <div class="uk-background-cover uk-width-3-4 uk-flex uk-flex-middle" uk-height-viewport style="background: lightgrey;">
                    <img src="${dataUrl}" id="croppr"/>
                </div>
                <div class="uk-padding-large uk-width-1-4 uk-flex uk-flex-column">
                    <button id="btn_crop" class="uk-margin uk-button uk-button-primary">Use current area</button>
                    <button id="btn_crop_cancel" class="uk-margin uk-button uk-button-default">Cancel</button>
                </div>
            </div>
        </div>
    </div>`;

    var div = document.createElement('div');
    div.id = "crop_wrapper";
    div.style.zIndex = "9999";
    div.innerHTML = modal_html_str;
    document.body.appendChild(div);

    var btn_crop = document.getElementById("btn_crop");
    var btn_crop_cancel = document.getElementById("btn_crop_cancel");

    var croppr = new Croppr('#croppr', ()=>{});

    btn_crop.addEventListener("click", function () {

        const cropRect = croppr.getValue();
        var canvas = null;
        if (document.getElementsByTagName("canvas").length > 0) { 
            canvas = document.getElementsByTagName("canvas")[0];
        } else {
            canvas = document.createElement("canvas");
        }  
        const context = canvas.getContext("2d");
        canvas.width = cropRect.width;
        canvas.height = cropRect.height;
        context.drawImage(
            croppr.imageEl,
            cropRect.x,
            cropRect.y,
            cropRect.width,
            cropRect.height,
            0,
            0,
            canvas.width,
            canvas.height,
        );
        var cropped_url = canvas.toDataURL();

        // var filename = new Date().toISOString()
        // filename = filename.replace(/[-:.TZ]/g, '');

        // var anchor = document.createElement("a");
        // anchor.href = cropped_url;
        // anchor.download = filename + "_" + "screenshot.png";
        // anchor.click();

        chrome.runtime.sendMessage({msg: "cropped", receiver: sender, dataUrl: cropped_url});
        UIkit.notification({message: '<div class=".uk-text-center" style="width:100%;">Cropped image added</div>', status: 'success', pos: 'top-center'})

    });

    btn_crop_cancel.addEventListener("click", function () {
        UIkit.modal("#crop-modal").hide();
        document.body.removeChild(document.getElementById("crop_wrapper"));
        document.body.removeChild(document.getElementById("crop-modal"));
        delete croppr;
    });



    

    UIkit.modal("#crop-modal").show();

}
