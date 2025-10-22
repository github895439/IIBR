var importData;
var context;
var img;
var selectedTargetName;
var taEle;
var canvasEle;
var divEle;

//複数選択はしない。
//　複数選択後に個別解除すると、他で関連してるものが一方的に解除されてしまうため。
//　(加味が手間。)

function importHandler() {
    importData = JSON.parse(taEle.value);

    for (const targetName in importData) {
        if (targetName == "settings") {
            continue;
        }

        importData[targetName]["selected"] = false;
    }

    return;
}

function resetHandler() {
    context.reset();
    context.textBaseline = "top";

    for (const targetName in importData) {
        if (targetName == "settings") {
            continue;
        }

        drawStructByData(targetName);
    }

    return;
}

function getTargetName(pstX, pstY) {
    let rtn;

    for (const targetName in importData) {
        if (targetName == "settings") {
            continue;
        }

        let target = importData[targetName];

        if (target.pstX > pstX) {
            continue;
        }

        if (target.pstY > pstY) {
            continue;
        }

        if (target.pstX + target.width < pstX) {
            continue;
        }

        if (target.pstY + target.height < pstY) {
            continue;
        }

        rtn = targetName;
        break;
    }

    return rtn;
}

function updateContext() {
    for (const targetName in importData) {
        if (targetName == "settings") {
            continue;
        }

        let target = importData[targetName];

        if (!target.selected) {
            continue;
        }

        drawLineByData(target);
    }

    return;
}

function drawStructByData(structName) {
    context.strokeStyle = "black";
    context.strokeRect(importData[structName].pstX, importData[structName].pstY, importData[structName].width, importData[structName].height);
    context.fillText(structName, importData[structName].pstX + importData.settings.STROKE_MARGIN, importData[structName].pstY + importData.settings.STROKE_MARGIN);
    context.fillText(importData[structName].inputString, importData[structName].pstX + importData.settings.STROKE_MARGIN, importData[structName].pstY + importData.settings.STROKE_MARGIN + importData.settings.fontSize);
    return;
}


function drawLineByData(target) {
    for (const lines of target.line) {
        context.beginPath();
        context.moveTo(target.pstX, target.pstY + target.height);
        context.lineTo(lines[0].pstX, lines[0].pstY);
        context.lineTo(lines[1].pstX, lines[1].pstY);
        context.lineTo(lines[2].pstX, lines[2].pstY);
        context.stroke();
    }

    return;
}

function drawLineForBack(targetName) {
    let queue = [targetName];

    while (queue.length > 0) {
        targetName = queue.shift();

        for (const tmpTargetName in importData) {
            if (tmpTargetName == "settings") {
                continue;
            }

            if (targetName == tmpTargetName) {
                continue;
            }

            let tmpTarget = importData[tmpTargetName];

            if (tmpTarget.selected) {
                continue;
            }

            for (const lines of tmpTarget.line) {
                if ((lines[2].pstX == importData[targetName].pstX) && (lines[2].pstY == importData[targetName].pstY)) {
                    tmpTarget.selected = true;

                    if (!queue.includes(tmpTargetName)) {
                        queue.push(tmpTargetName)
                    }

                    break;
                }
            }
        }

        if (document.querySelector("#cbNearestBack").checked) {
            break;
        }
    }

    return;
}

function canvasClickHandler(params) {
    resetHandler();
    importHandler();

    if (!selectedTargetName == "") {
        selectedTargetName = "";
        return;
    }

    let pstX = params.x - canvasEle.getBoundingClientRect().left;
    let pstY = params.y - canvasEle.getBoundingClientRect().top;
    let targetName = getTargetName(pstX, pstY);

    if (targetName == undefined) {
        return;
    }

    selectedTargetName = targetName;
    let target = importData[targetName];
    target.selected = true;
    drawLineForBack(targetName);
    updateContext();
    return;
}

window.addEventListener("load", function () {
    main();
    return;
});

function main() {
    selectedTargetName = "";
    taEle = document.querySelector("#import");

    if (taEle.value == "") {
        return;
    }

    importHandler();
    canvasEle = document.createElement("canvas");
    canvasEle.id = "canvas_1";
    canvasEle.width = importData.settings.canvasWidth;
    canvasEle.height = importData.settings.canvasHeight;
    canvasEle.addEventListener("click", canvasClickHandler);
    context = canvasEle.getContext('2d');
    divEle = document.querySelector("#div_1");
    divEle.appendChild(canvasEle);
    document.querySelector("input[type='button'][value='IMPORT']").addEventListener("click", importHandler);
    document.querySelector("input[type='button'][value='RESET']").addEventListener("click", resetHandler);
    resetHandler();
    return;
}
