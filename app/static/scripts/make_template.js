let data_json = JSON.parse(data_frame)
let dataLength = Object.keys(data_json).length

const options = config.fieldValues
const regexes = config.regex

const invoiceImage = document.querySelector(".invoice_image")
const image = new Image()
image.src = "../static/invoices/" + invoice_name
const invoiceRatio = invoiceImage.offsetHeight / image.height

let maxLeft = invoiceImage.offsetWidth
let maxRight = 0
let maxTop = invoiceImage.offsetHeight
let maxBottom = 0

let arraySelected = []
let ctrlSelectedID = []
let ctrlSelected = []

let box = document.getElementById("box")
const table = document.getElementById("labelsTable")
const boxTable = document.getElementById("boxTable")
const previewBox = document.getElementById("previewBox")
const templateName = document.getElementById("templateName")

if (templates && templateNumber) {
    const template = templates[parseInt(templateNumber)]

    templateName.value = template.tempName
    let templateLabels = template.labels
    let templateBoxes = template.boxes

    for (let i = 0; i < templateLabels.length; i++) {
        let currentLabel = templateLabels[i]
        arraySelected.push(currentLabel.eID)

        let label = document.createElement("select")
        let regexSelect = document.createElement("select")
        const optionNone = document.createElement("option")
        optionNone.value = "none"
        optionNone.text = "none"
        let deleteButton = document.createElement("button")
        deleteButton.onclick = deleteLabelRow
        deleteButton.style.width = "80%"
        deleteButton.style.height = "80%"
        deleteButton.innerHTML = "DELETE ROW"
        deleteButton.onmouseenter = deleteHover
        deleteButton.onmouseleave = deleteHoverOff
        const row = table.insertRow(-1)
        row.id = "row_" + currentLabel.eID
        row.onmouseenter = labelHover
        row.onmouseleave = labelHoverOff

        let cell = row.insertCell(0)
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement("option")
            option.value = options[i]
            option.text = options[i]
            label.appendChild(option)
        }
        label.value = currentLabel.field_name
        cell.appendChild(label)

        regexSelect.appendChild(optionNone)
        for (let j = 0; j < regexes.length; j++) {
            const option = document.createElement("option")
            option.value = regexes[j].name
            option.text = regexes[j].name
            regexSelect.appendChild(option)
        }
        regexSelect.value = currentLabel.regex
        cell = row.insertCell(1)
        cell.appendChild(regexSelect)

        cell = row.insertCell(2)
        cell.innerHTML = Math.round(currentLabel.left * invoiceRatio)

        cell = row.insertCell(3)
        cell.innerHTML = Math.round(currentLabel.top * invoiceRatio)

        cell = row.insertCell(4)
        cell.innerHTML = Math.round(currentLabel.width * invoiceRatio)

        cell = row.insertCell(5)
        cell.innerHTML = Math.round(currentLabel.height * invoiceRatio)

        cell = row.insertCell(6)
        cell.innerHTML = currentLabel.content

        cell = row.insertCell(7)
        cell.appendChild(deleteButton)
    }

    for (let i = 0; i < templateBoxes.length; i++) {
        let currentBox = templateBoxes[i]
        let label = document.createElement("select")
        let regexSelect = document.createElement("select")
        const optionNone = document.createElement("option")
        optionNone.value = "none"
        optionNone.text = "none"
        let deleteButton = document.createElement("button")
        deleteButton.onclick = deleteLabelRowBox
        deleteButton.style.width = "80%"
        deleteButton.style.height = "80%"
        deleteButton.innerHTML = "DELETE ROW"
        deleteButton.onmouseenter = deleteHover
        deleteButton.onmouseleave = deleteHoverOff

        let row = boxTable.insertRow(-1)
        row.onmouseenter = labelHoverBox
        row.onmouseleave = labelHoverBoxOff
        let cell = row.insertCell(0)
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement("option")
            option.value = options[i]
            option.text = options[i]
            label.appendChild(option)
        }
        label.value = currentBox.field_name
        cell.appendChild(label)

        regexSelect.appendChild(optionNone)
        for (let j = 0; j < regexes.length; j++) {
            const option = document.createElement("option")
            option.value = regexes[j].name
            option.text = regexes[j].name
            regexSelect.appendChild(option)
        }
        regexSelect.value = currentBox.regex
        cell = row.insertCell(1)
        cell.appendChild(regexSelect)

        cell = row.insertCell(2)
        cell.innerHTML = Math.round(currentBox.left * invoiceRatio)

        cell = row.insertCell(3)
        cell.innerHTML = Math.round(currentBox.right * invoiceRatio)

        cell = row.insertCell(4)
        cell.innerHTML = Math.round(currentBox.top * invoiceRatio)

        cell = row.insertCell(5)
        cell.innerHTML = Math.round(currentBox.bottom * invoiceRatio)

        cell = row.insertCell(6)
        cell.appendChild(deleteButton)
    }
}

function resetBox() {
    for (let i = 0; i < ctrlSelectedID.length; i++) {
        document.getElementById(ctrlSelectedID[i]).style.backgroundColor = "white"
    }
    maxLeft = invoiceImage.offsetWidth
    maxRight = 0
    maxTop = invoiceImage.offsetHeight
    maxBottom = 0
    ctrlSelectedID = []
    ctrlSelected = []
    box.style.left = 0
    box.style.top = 0
    box.style.height = 0
    box.style.width = 0
    document.getElementById("max").innerHTML = "left, right, top, bottom: 0, 0, 0, 0"
    document.getElementById("box_selected").innerHTML = "box selected: " + ctrlSelectedID
}

function labelSelected(e) {
    console.log(e)
    let eID = e.target.id
    let data = data_json[eID]
    let data_left = parseInt(data.left) * invoiceRatio
    let data_width = parseInt(data.width) * invoiceRatio
    let data_top = parseInt(data.top) * invoiceRatio
    let data_height = parseInt(data.height) * invoiceRatio
    if (window.event.ctrlKey) {
        if (ctrlSelectedID.includes(eID)) {
            ctrlSelectedID.splice(ctrlSelectedID.indexOf(eID), 1)
            e.target.style.backgroundColor = "white"
        } else {
            ctrlSelectedID.push(eID)
            e.target.style.backgroundColor = "black"
            console.log(eID)
            ctrlSelected.push({
                "coordX": Math.round(parseInt(data.left) + (parseInt(data.width) / 2)),
                "coordY": Math.round(parseInt(data.top) + (parseInt(data.height) / 2))
            })
        }
        if (data_left < maxLeft) {
            maxLeft = data_left
        }
        if (data_top < maxTop) {
            maxTop = data_top
        }
        if (data_left + data_width > maxRight) {
            maxRight = data_left + data_width
        }
        if (data_top + data_height > maxBottom) {
            maxBottom = data_top + data_height
        }
        document.getElementById("box").style.left = maxLeft + "px"
        document.getElementById("box").style.top = maxTop + "px"
        document.getElementById("box").style.height = maxBottom - maxTop + "px"
        document.getElementById("box").style.width = maxRight - maxLeft + "px"

        document.getElementById("max").innerHTML = "left, right, top, bottom: " + Math.round(maxLeft) + ", " + Math.round(maxRight) + ", " + Math.round(maxTop) + ", " + Math.round(maxBottom)
        document.getElementById("box_selected").innerHTML = "box selected: " + ctrlSelectedID
    } else {
        //reseting the values of box
        resetBox()

        if (!arraySelected.includes(eID)) {
            arraySelected.push(eID)
            let label_container = document.querySelector(".labels_container")

            const label = document.createElement("select")
            label.id = "label_" + eID
            let regexSelect = document.createElement("select")
            const optionNone = document.createElement("option")
            optionNone.value = "none"
            optionNone.text = "none"
            const deleteButton = document.createElement("button")
            deleteButton.onclick = deleteLabelRow
            deleteButton.style.width = "80%"
            deleteButton.style.height = "80%"
            deleteButton.innerHTML = "DELETE ROW"
            deleteButton.onmouseenter = deleteHover
            deleteButton.onmouseleave = deleteHoverOff
            deleteButton.id = "deleteButton_" + eID

            const row = table.insertRow(-1)
            row.onmouseenter = labelHover
            row.onmouseleave = labelHoverOff
            row.id = "row_" + eID

            let cell = row.insertCell(0)
            for (let i = 0; i < options.length; i++) {
                const option = document.createElement("option")
                option.value = options[i]
                option.text = options[i]
                label.appendChild(option)
            }
            cell.appendChild(label)

            regexSelect.appendChild(optionNone)
            for (let j = 0; j < regexes.length; j++) {
                const option = document.createElement("option")
                option.value = regexes[j].name
                option.text = regexes[j].name
                regexSelect.appendChild(option)
            }
            cell = row.insertCell(1)
            cell.appendChild(regexSelect)

            cell = row.insertCell(2)
            cell.innerHTML = Math.round(data_left)

            cell = row.insertCell(3)
            cell.innerHTML = Math.round(data_top)

            cell = row.insertCell(4)
            cell.innerHTML = Math.round(data_width)

            cell = row.insertCell(5)
            cell.innerHTML = Math.round(data_height)

            cell = row.insertCell(6)
            cell.innerHTML = data_json[eID].text

            cell = row.insertCell(7)
            cell.appendChild(deleteButton)
        }
    }
}

function addBox() {
    if (ctrlSelectedID.length > 0) {
        const label = document.createElement("select")
        let regexSelect = document.createElement("select")
        const optionNone = document.createElement("option")
        optionNone.value = "none"
        optionNone.text = "none"
        const deleteButton = document.createElement("button")
        deleteButton.onclick = deleteLabelRowBox
        deleteButton.style.width = "80%"
        deleteButton.style.height = "80%"
        deleteButton.innerHTML = "DELETE ROW"
        deleteButton.onmouseenter = deleteHover
        deleteButton.onmouseleave = deleteHoverOff

        const row = boxTable.insertRow(-1)
        row.onmouseenter = labelHoverBox
        row.onmouseleave = labelHoverBoxOff
        let cell = row.insertCell(0)
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement("option")
            option.value = options[i]
            option.text = options[i]
            label.appendChild(option)
        }
        cell.appendChild(label)

        regexSelect.appendChild(optionNone)
        for (let j = 0; j < regexes.length; j++) {
            const option = document.createElement("option")
            option.value = regexes[j].name
            option.text = regexes[j].name
            regexSelect.appendChild(option)
        }
        cell = row.insertCell(1)
        cell.appendChild(regexSelect)

        cell = row.insertCell(2)
        cell.innerHTML = Math.round(maxLeft)

        cell = row.insertCell(3)
        cell.innerHTML = Math.round(maxRight)

        cell = row.insertCell(4)
        cell.innerHTML = Math.round(maxTop)

        cell = row.insertCell(5)
        cell.innerHTML = Math.round(maxBottom)

        cell = row.insertCell(6)
        cell.appendChild(deleteButton)
    }
}

function removeBox(e) {
    e.target.remove()
}

function deleteLabelRow(e) {
    // let eID = e.target.id.split('_')[1]
    // arraySelected.splice(arraySelected.indexOf(eID), 1)
    rowIndex = e.target.offsetParent.parentElement.rowIndex
    table.deleteRow(rowIndex)
    arraySelected.splice(rowIndex - 1, 1)
    previewBox.style.left = "0px"
    previewBox.style.top = "0px"
    previewBox.style.width = "0px"
    previewBox.style.height = "0px"
}

function deleteLabelRowBox(e) {
    boxTable.deleteRow(e.target.offsetParent.parentElement.rowIndex)
    previewBox.style.left = "0px"
    previewBox.style.top = "0px"
    previewBox.style.width = "0px"
    previewBox.style.height = "0px"
}

function deleteHover(e) {
    e.target.parentNode.parentNode.style.backgroundColor = "red"
}

function deleteHoverOff(e) {
    e.target.parentNode.parentNode.style.backgroundColor = "white"
}

function labelHover(e) {
    previewBox.style.left = e.target.cells[2].innerHTML + "px"
    previewBox.style.top = e.target.cells[3].innerHTML + "px"
    previewBox.style.width = e.target.cells[4].innerHTML + "px"
    previewBox.style.height = e.target.cells[5].innerHTML + "px"
}

function labelHoverBoxOff() {
    previewBox.style.left = "0px"
    previewBox.style.top = "0px"
    previewBox.style.width = "0px"
    previewBox.style.height = "0px"
}

function labelHoverBox(e) {
    previewBox.style.left = e.target.cells[2].innerHTML + "px"
    previewBox.style.width = parseInt(e.target.cells[3].innerHTML) - parseInt(e.target.cells[2].innerHTML) + "px"
    previewBox.style.top = e.target.cells[4].innerHTML + "px"
    previewBox.style.height = parseInt(e.target.cells[5].innerHTML) - parseInt(e.target.cells[4].innerHTML) + "px"
}

function labelHoverOff() {
    previewBox.style.left = "0px"
    previewBox.style.top = "0px"
    previewBox.style.width = "0px"
    previewBox.style.height = "0px"
}

function export_labels() {
    const tempName = document.getElementById("templateName").value
    if (!tempName) {
        return;
    }
    let values = []
    let labels = []
    let boxes = []
    for (let i = 1; i < table.rows.length; i++) {
        labels.push({
            "field_name": table.rows[i].cells[0].firstChild.value,
            "regex": table.rows[i].cells[1].firstChild.value,
            "left": Math.round(parseInt(table.rows[i].cells[2].innerHTML) / invoiceRatio),
            "top": Math.round(parseInt(table.rows[i].cells[3].innerHTML) / invoiceRatio),
            "width": Math.round(parseInt(table.rows[i].cells[4].innerHTML) / invoiceRatio),
            "height": Math.round(parseInt(table.rows[i].cells[5].innerHTML) / invoiceRatio),
            "content": table.rows[i].cells[6].innerHTML,
            "eID": parseInt(table.rows[i].id.split('_')[1])
        })
    }
    for (let i = 1; i < boxTable.rows.length; i++) {
        boxes.push({
            "field_name": boxTable.rows[i].cells[0].firstChild.value,
            "regex": boxTable.rows[i].cells[1].firstChild.value,
            "left": Math.round(parseInt(boxTable.rows[i].cells[2].innerHTML) / invoiceRatio),
            "right": Math.round(parseInt(boxTable.rows[i].cells[3].innerHTML) / invoiceRatio),
            "top": Math.round(parseInt(boxTable.rows[i].cells[4].innerHTML) / invoiceRatio),
            "bottom": Math.round(parseInt(boxTable.rows[i].cells[5].innerHTML) / invoiceRatio)
        })
    }

    let template = {
        invoiceName: invoice_name, tempName: tempName, labels: labels, boxes: boxes
    }

    console.log(values)
    fetch('/template/save', {
        method: "POST", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify(template)
    }).then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch((error) => {
            console.error(error)
        })
}

for (let i = 0; i < dataLength; i++) {
    const button = document.createElement("button")
    button.id = i
    button.onclick = labelSelected
    let data = data_json[i]
    button.style.cssText = "position: absolute; top: " + data.top * invoiceRatio + "px; left: " + data.left * invoiceRatio + "px; right: 0px; bottom: 0px; width: " + data.width * invoiceRatio + "px; height: " + data.height * invoiceRatio + "px; opacity: 0.3;"
    document.querySelector(".image_container").appendChild(button)
}

// document.addEventListener('DOMContentLoaded', function () {
//
// }, false);


