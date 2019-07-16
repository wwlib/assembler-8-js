var btn = document.querySelector(".sai");
var setHtml = document.querySelector(".setHtml");
var getText = document.querySelector(".getText");
var setCss = document.querySelector(".setCss");
var reset = document.querySelector(".reset");
var clear = document.querySelector(".clear");
var cssContent = document.querySelector(".csscontent");
var content = document.querySelector(".getcontent");
var editorContent = document.querySelector(".editor");

const spanClassNameMap = {
    asmLabel: 0,
    asmOpcode: 1,
    asmArg: 2,
    asmComment: 3,
    asmAsterisk: 4,
}

const spanClassNames = Object.keys(spanClassNameMap);

content.innerText = ``;
editorContent.innerHTML = '';

const editorCss = `.asmLabel { 
    color: #4FA550;
    float: left;
    width: 100px;
}

.asmOpcode { 
    color: #4FA550;
    float: left;
    width: 50px;
}

.asmArg { 
    color: #4FA550;
    float: left;
    width: 200px;
}

.asmComment { 
    color: #4FA550;
}

.editor div {
    margin-bottom: 2px;
}
`

var styleNode = document.createElement('style');
styleNode.type = "text/css";
var styleText = document.createTextNode(editorCss);
styleNode.appendChild(styleText);
document.getElementsByTagName('head')[0].appendChild(styleNode);
styleNode.innerText = editorCss;

cssContent.value = editorCss;

/*
    Key Codes
    Left    37
    Up      38
    Right   39
    Down    40
*/

editorContent.onkeydown = function (evt) {
    evt = evt || window.event;
    // console.log("keydown: ", evt.keyCode, evt.key, evt);
    if (evt.keyCode == 9) {
        evt.preventDefault();
        // const editedSpan = getEditedSpan();
        // console.log(`editedSpan:`, editedSpan);
        if (evt.shiftKey) {
            selectPreviousSpan();
        } else {
            selectNextSpan();
        }
    } else if (evt.keyCode == 13) {
        evt.preventDefault();
        const editedSpan = getEditedSpan();
        const parentDiv = getParentDiv(editedSpan);
        if (parentDiv) {
            const container = parentDiv.parentNode;
            const previousDiv = parentDiv.previousSibling;
            const nextDiv = parentDiv.nextSibling;
            let firstSpan = undefined;
            if (evt.shiftKey) {
                container.removeChild(parentDiv);
                firstSpan = getFirstSpan(previousDiv);
            } else {
                const newDiv = document.createElement('div');
                newDiv.innerHTML = `<span class="asmLabel"> </span><span class="asmOpcode"> </span><span class="asmArg"> </span><span class="asmComment"> </span>`;
                if (getSpanClassIndex(editedSpan) == 0) {
                    container.insertBefore(newDiv, parentDiv);
                } else {
                    container.insertBefore(newDiv, nextDiv);
                }
                firstSpan = getFirstSpan(newDiv);
            }
            if (firstSpan) {
                const spanText = getSpanText(firstSpan);
                const sel = document.getSelection();
                const textNode = firstSpan.childNodes[0];
                if (textNode) {
                    const anchorOffset = spanText.length;
                    const range = document.createRange();
                    sel.removeAllRanges();
                    range.setStart(textNode, anchorOffset);
                    range.setEnd(textNode, anchorOffset);
                    sel.addRange(range);
                }
            }
        }
    }
};

editorContent.onkeyup = function (evt) {
    evt = evt || window.event;
    // console.log("onkeyup: " + evt.keyCode);
    switch (evt.keyCode) {
        // case 91: // Command Key
        case 18:
        case 16:
        case 9:
            break;
        case 13:
            evt.preventDefault();
            // const parentDiv = getParentDiv(getEditedSpan());
            // if (!isValidDiv(parentDiv)) {
            //     const reformatDivData = reformatDiv(parentDiv, 'asmLabel', 0);
            // }
            // const firstSpan = getFirstSpan(parentDiv);
            // const spanText = getSpanText(firstSpan);
            // const sel = document.getSelection();
            // const textNode = firstSpan.childNodes[0];
            // if (textNode) {
            //     const anchorOffset = spanText.length;
            //     const range = document.createRange();
            //     sel.removeAllRanges();
            //     range.setStart(textNode, anchorOffset);
            //     range.setEnd(textNode, anchorOffset);
            //     sel.addRange(range);
            // }
            break;
        default:
            const rewriteData = rewriteContent();
            // console.log(`keyup: rewriteData:`, rewriteData);
            if (rewriteData.spaceTab) {
                selectNextSpan();
            }
            break
    }
}

rewriteContent = function () {
    let result = { spaceTab: false }
    const divs = editorContent.getElementsByTagName('div');
    // console.log(`elements:`, divs);

    // Starting from "clear". No divs.
    if (divs.length == 0) {
        const innerText = editorContent.innerText;
        // const textContent = editorContent.textContent;
        // const innerHTML = editorContent.innerHTML;
        const lines = innerText.split('\n');
        // console.log(`innerText:`, innerText);
        // console.log(`textContent:`, textContent);
        // console.log(`innerHTML:`, innerHTML);
        // console.log(`lines: count:`, lines.length);
        // console.log(`lines:`, JSON.stringify(lines, null, 2));
        let linesHtml = '';
        lines.forEach(line => {
            const firstCharacter = line.substring(0, 1);
            let lineHtml = '';
            if (firstCharacter == '*') {
                lineHtml += `<span class="${spanClassNames[4]}">${line}</span>`;
            } else {
                const parts = line.split(' ');
                let comment = '';
                const numParts = parts.length;
                for (let i = 0; i < numParts; i++) {
                    const part = parts[i] || ' ';
                    switch (i) {
                        case 0:
                        case 1:
                        case 2:
                            lineHtml += `<span class="${spanClassNames[i]}">${part}</span>`;
                            break;
                        default:
                            comment += part;
                            if (i < numParts - 1) {
                                comment += ' ';
                            }
                            break;
                    }
                }
                comment = comment || ' '
                lineHtml += `<span class="${spanClassNames[3]}">${comment}</span>`;
            }
            if (lineHtml) {
                linesHtml += `<div>${lineHtml}</div>`;
            }
        });
        editorContent.innerHTML = linesHtml;
        // Set selection: end of first span
        const sel = document.getSelection();
        const firstDiv = getFirstDiv();
        const firstSpan = getFirstSpan(firstDiv);
        const spanText = getSpanText(firstSpan);
        const textNode = firstSpan.childNodes[0];
        if (textNode) {
            const anchorOffset = spanText.length;
            const range = document.createRange();
            sel.removeAllRanges();
            range.setStart(textNode, anchorOffset);
            range.setEnd(textNode, anchorOffset);
            sel.addRange(range);
        }
    } else {
        const sel = document.getSelection();
        // console.log(sel);
        const anchorNode = sel.anchorNode;
        let anchorOffset = sel.anchorOffset;
        // console.log(`anchorNode:`, anchorNode);
        // console.log(`anchorOffset:`, anchorNode);
        let closestSpan = getClosestSpan(anchorNode);
        if (closestSpan) {
            const editedSpanClassName = closestSpan.className;
            // console.log(`closestSpan:`, closestSpan, editedSpanClassName);
            const parentDiv = getParentDiv(anchorNode)
            const reformatDivData = reformatDiv(parentDiv, editedSpanClassName, anchorOffset);
            // console.log(`reformatDivData:`, reformatDivData);
            result.spaceTab = reformatDivData.spaceTab;
            if (reformatDivData && reformatDivData.selectionOffset) {
                anchorOffset = reformatDivData.selectionOffset
            }
            closestSpan = parentDiv.getElementsByClassName(editedSpanClassName)[0];
            // console.log(closestSpan);
            if (closestSpan) {
                // closestSpan.selectionStart = anchorOffset;
                const textNode = closestSpan.childNodes[0];
                const range = document.createRange();
                range.setStart(textNode, anchorOffset);
                range.setEnd(textNode, anchorOffset);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }
    return result;
}

getMerlinText = function () {
    let result = '';
    const divs = editorContent.getElementsByTagName('div');
    if (divs) {
        const numDivs = divs.length;
        for (let i = 0; i < numDivs; i++) {
            const div = divs[i];
            const spans = div.getElementsByTagName('span');
            if (spans) {
                const numSpans = spans.length;
                const lineTextArray = [];
                for (let j = 0; j < numSpans; j++) {
                    const span = spans[j];
                    let spanText = getSpanText(span);
                    // spanText = spanText.replace(/\s/g, '~');
                    lineTextArray.push(spanText);
                }
                result += lineTextArray.join(' ') + '\n';
            }
        }
    }
    return result;
}

getLineHtmlWithLineTextArray = function (lineTextArray, editedSpanClassName, selectionOffset) {
    const spans = [];
    const editedSpanIndex = spanClassNameMap[editedSpanClassName];
    // console.log(`getLineHtmlWithLineTextArray: editedSpanClassName:`, editedSpanClassName, editedSpanIndex);
    // add default spans
    let lineHtml = '';
    let spaceTab = false; // was space typed at the end of a term
    if (editedSpanClassName == 'asmAsterisk') {
        if (lineTextArray && lineTextArray.length > 0) {
            let line = lineTextArray.join(' ');
            line = line.replace(/~/g, ' ');
            lineHtml += `<span class="${spanClassNames[4]}">${line}</span>`;
        }
    } else {
        for (let s = 0; s < 4; s++) {
            spans.push(`<span class="${spanClassNames[s]}"> </span>`);
        }
        const lineText = lineTextArray.join(' ');
        const parts = lineText.split(' ');

        let comment = '';
        const numParts = parts.length;
        // LABEL
        let part = parts[0];
        if (part) {
            part = part.replace(/~+/g, '') || ' ';
            if (editedSpanIndex == 0 && selectionOffset > part.length) {
                selectionOffset = part.length;
                spaceTab = true;
            }
            spans[0] = `<span class="${spanClassNames[0]}">${part}</span>`;
        }
        // OPCODE
        part = parts[1];
        if (part) {
            part = part.replace(/~+/g, '') || ' ';
            if (editedSpanIndex == 1 && selectionOffset > part.length) {
                selectionOffset = part.length;
                spaceTab = true;
            }
            spans[1] = `<span class="${spanClassNames[1]}">${part}</span>`;
        }
        // ARG
        part = parts[2];
        if (part) {
            part = part.replace(/~+/g, '') || ' ';
            if (editedSpanIndex == 2 && selectionOffset > part.length) {
                selectionOffset = part.length;
                spaceTab = true;
            }
            spans[2] = `<span class="${spanClassNames[2]}">${part}</span>`;
        }
        // COMMENTS
        if (numParts > 3) {
            comment = parts[3];
            comment = comment.replace(/~/g, ' ');
            if (editedSpanIndex == 3 && selectionOffset > comment.length) {
                selectionOffset = comment.length
            }
            // const commentLastCharacter = comment.substring(comment.length - 1);
            spans[3] = `<span class="${spanClassNames[3]}">${comment}</span>`;
        }
        lineHtml += spans.join('');
    }
    return { lineHtml: lineHtml, selectionOffset: selectionOffset, spaceTab: spaceTab };
}

reformatDiv = function (div, editedSpanClassName, anchorOffset) {
    // console.log(`reformatDiv:`, div, anchorOffset);
    // console.log(`[${div.textContent}]`);
    const spans = div.getElementsByTagName('span');
    // console.log(spans);
    const numSpans = spans.length;
    let lineTextArray = [];
    for (let i = 0; i < numSpans; i++) {
        const span = spans[i];
        let spanText = span.textContent;
        spanText = spanText.replace(/\s/g, '~');
        lineTextArray.push(spanText);
    }
    // console.log(`lineTextArray: [${lineTextArray}]`);
    const lineHtmlData = getLineHtmlWithLineTextArray(lineTextArray, editedSpanClassName, anchorOffset);
    // console.log(`reformatDiv: lineHtml:`, lineHtmlData.lineHtml);
    div.innerHTML = lineHtmlData.lineHtml;
    return { selectionOffset: lineHtmlData.selectionOffset, spaceTab: lineHtmlData.spaceTab }
}

selectNextSpan = function () {
    const editedSpan = getEditedSpan();
    if (editedSpan) {
        const nextSpan = getNextSpan(editedSpan);
        if (nextSpan) {
            const sel = document.getSelection();
            sel.removeAllRanges();
            // console.log(`sel.anchorOffset:`, sel.anchorOffset);
            const spanText = getSpanText(nextSpan);
            // console.log(`selectNextSpan:`, nextSpan, spanText);
            const textNode = nextSpan.childNodes[0];
            if (textNode) {
                const anchorOffset = spanText.length;
                const range = document.createRange();
                range.setStart(textNode, anchorOffset);
                range.setEnd(textNode, anchorOffset);
                sel.addRange(range);
            }
        }
    }
}

selectPreviousSpan = function () {
    const editedSpan = getEditedSpan();
    if (editedSpan) {
        const nextSpan = getPreviousSpan(editedSpan);
        if (nextSpan) {
            const sel = document.getSelection();
            sel.removeAllRanges();
            // console.log(`sel.anchorOffset:`, sel.anchorOffset);
            const spanText = getSpanText(nextSpan);
            // console.log(`selectPreviousSpan:`, nextSpan, spanText);
            const textNode = nextSpan.childNodes[0];
            if (textNode) {
                const anchorOffset = spanText.length;
                const range = document.createRange();
                range.setStart(textNode, anchorOffset);
                range.setEnd(textNode, anchorOffset);
                sel.addRange(range);
            }
        }
    }
}

getFirstDiv = function () {
    let firstDiv = undefined;
    const divs = editorContent.getElementsByTagName('div');
    if (divs && divs[0]) {
        firstDiv = divs[0]
    }
    return firstDiv;
}

getFirstSpan = function (div) {
    let firstSpan = undefined;
    if (div) {
        const spans = div.getElementsByTagName('span');
        if (spans && spans[0]) {
            firstSpan = spans[0]
        }
    }
    return firstSpan;
}

getSpanClassIndex = function (span) {
    let spanClassIndex = -1;
    if (span) {
        const spanClassName = span.className;
        spanClassIndex = spanClassNameMap[spanClassName];
    }
    return spanClassIndex;
}

getNextSpan = function (currentSpan) {
    let nextSpan = currentSpan;
    const parentDiv = getParentDiv(currentSpan);
    if (parentDiv) {
        const currentSpanClassIndex = getSpanClassIndex(currentSpan);
        const spans = parentDiv.getElementsByTagName('span');
        if (spans && spans[currentSpanClassIndex + 1]) {
            nextSpan = spans[currentSpanClassIndex + 1]
        }
    }
    return nextSpan;
}

getPreviousSpan = function (currentSpan) {
    let nextSpan = currentSpan;
    const parentDiv = getParentDiv(currentSpan);
    if (parentDiv) {
        const currentSpanClassIndex = getSpanClassIndex(currentSpan);
        const spans = parentDiv.getElementsByTagName('span');
        if (spans && spans[currentSpanClassIndex - 1]) {
            nextSpan = spans[currentSpanClassIndex - 1]
        }
    }
    return nextSpan;
}

getSpanText = function (span, noTrim) {
    let spanText = '';
    if (span) {
        if (noTrim) {
            spanText = span.textContent;
        } else {
            spanText = span.textContent.trim();
        }
    }
    return spanText;
}

getParentDiv = function (element) {
    let closestDiv = undefined;
    if (element) {
        if (element.closest) {
            closestDiv = element.closest("div");
        } else if (element.parentElement.closest) {
            closestDiv = element.parentElement.closest("div");
        }
    }
    return closestDiv
}

getClosestSpan = function (element) {
    let closestSpan = undefined;
    if (element) {
        if (element.closest) {
            closestSpan = element.closest("span");
        } else if (element.parentElement.closest) {
            closestSpan = element.parentElement.closest("span");
        }
    }
    return closestSpan
}

getEditedSpan = function () {
    const sel = document.getSelection();
    // console.log(sel);
    const anchorNode = sel.anchorNode;
    const editedSpan = getClosestSpan(anchorNode);
    return editedSpan;
}

createNewDiv = function () {

}

isValidDiv = function (div) {
    let validDiv = true;
    const spans = div.getElementsByTagName('span');
    const numSpans = spans.length;
    if (numSpans != 4) {
        validDiv = false;
    } else {
        for (let i = 0; i < numSpans; i++) {
            if (spans[i].className != spanClassNames[i]) {
                validDiv = false;
            }
        }
    }
    return validDiv;
}

btn.addEventListener("click", function () {
    var s = editorContent.innerHTML;
    content.style.display = "block";
    content.value = s;
});

setHtml.addEventListener("click", function () {
    const html = content.value;
    // console.log(html)
    editorContent.innerHTML = html;
    rewriteContent();
});

getText.addEventListener("click", function () {
    content.style.display = "block";
    getEditorText();
});

getEditorText = function () {
    content.value = getMerlinText();
}

cssContent.onkeydown = function (evt) {
    evt = evt || window.event;
    // console.log("keydown: " + evt.keyCode);
    if (evt.keyCode == 9) {
        evt.preventDefault();
        insertText(cssContent, '    ')
        // const selectionStart = cssContent.selectionStart;
        // console.log(selectionStart);
        // const text = cssContent.value;
        // const before = text.substring(0,selectionStart);
        // const after = text.substring(selectionStart);
        // console.log(before);
        // console.log(after);
        // cssContent.value = before + '    ' + after;
        // cssContent.selectionStart = selectionStart + 4;
        // cssContent.selectionEnd = selectionStart + 4;
    }
};

insertText = function (element, text) {
    const selectionStart = element.selectionStart;
    const content = element.value;
    const before = content.substring(0, selectionStart);
    const after = content.substring(selectionStart);
    const textLength = text.length;
    element.value = before + text + after;
    element.selectionStart = selectionStart + textLength;
    element.selectionEnd = selectionStart + textLength;
}

setCss.addEventListener("click", function () {
    // console.log(`setCss:`, styleNode);
    styleNode.innerText = cssContent.value;
    // console.log(`setCss:`, styleNode);
});

reset.addEventListener("click", function () {
    // console.log(`reset:`);
    resetEditor();
});

resetEditor = function () {
    //     editorContent.innerHTML = ` OBJ $300 ;DEMO PROGRAM
    //  ORG $300
    //  EQU $F8DD
    // START JSR BELL ;RING THE BELL
    // END RTS
    // `;
    editorContent.innerHTML = `*****************************************
*           PATTERN KEYS                *
*****************************************
 ORG $0800 
PATT EQU $FC 
GRAPH EQU $C050 ; DEFINE SOFT SWITCHES
TEXT EQU $C051 
MIXED EQU $C053 
HIRES EQU $C057 
PGONE EQU $C054 
KEYIN EQU $FD1B ; LOCATION TO READ THE KEYBOARD
LSB EQU $FA 
MSB EQU $FB 
CHAR EQU $C000 ; INITIAL BYTE PATTERN
CLEAR LDA #$01 
 STA PATT 
 JSR DRAW 
 JMP KEYLOOP 
SET LDA #$FF 
 STA PATT 
 JSR DRAW 
KEYLOOP LDA CHAR 
 CMP #$80 ; CHECK FOR CHARACTER
 BCC KEYLOOP ; WAIT FOR CHARACTER
 JSR KEYIN ; GET KEY VALUE
 STA PATT ; SET PATT TO KEY VALUE
 CMP #$C3 ; CHECK FOR C
 BEQ END ; END IF C
 NOP 
 LDA $C010 ; CLEAR THE KEY STROBE
 JSR DRAW 
 JMP KEYLOOP 
ROTATE CLC 
 ROL PATT 
 BNE ROTRET 
 LDA #$01 
 STA PATT 
ROTRET RTS 
END LDA TEXT ; SET TEXT MODE
 BRK 
DRAW LDA #$20 
 STA MSB 
 LDA #$00 
 STA LSB 
 LDY #$00 ; TRIGGER SOFT SWITCHES
 LDA GRAPH 
 LDA HIRES 
 LDA PGONE 
LOOP LDA PATT 
 STA (LSB),Y 
 INC LSB 
 BEQ BUMPMSB 
 JMP LOOP 
BUMPMSB INC MSB 
 LDA #$40 
 CMP MSB 
 BEQ RETURN 
 JMP LOOP 
RETURN RTS
`
    rewriteContent();
}

clear.addEventListener("click", function () {
    // console.log(`clear:`);
    editorContent.innerHTML = ``;
});

function link() {
    var url = prompt("Enter the URL");
    document.execCommand("createLink", false, url);
}

function copy() {
    document.execCommand("copy", false, "");
}

function changeColor() {
    var color = prompt("Enter your color in hex ex:#f1f233");
    document.execCommand("foreColor", false, color);
}


function getImage() {
    var file = document.querySelector("input[type=file]").files[0];

    var reader = new FileReader();

    let dataURI;

    reader.addEventListener(
        "load",
        function () {
            dataURI = reader.result;

            const img = document.createElement("img");
            img.src = dataURI;
            editorContent.appendChild(img);
        },
        false
    );

    if (file) {
        console.log("s");
        reader.readAsDataURL(file);
    }
}

function printMe() {
    if (confirm("Check your Content before print")) {
        const body = document.body;
        let s = body.innerHTML;
        body.textContent = editorContent.innerHTML;

        document.execCommandShowHelp;
        body.style.whiteSpace = "pre";
        window.print();
        location.reload();
    }
}

resetEditor();
getEditorText();