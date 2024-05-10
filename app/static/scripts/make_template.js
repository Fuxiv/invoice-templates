data_json = JSON.parse(data_frame)
dataLength = Object.keys(data_json).length

const options = ["Balance due", "Date", "Client"]

invoiceImage = document.querySelector(".invoice_image")
const image = new Image()
image.src = "../static/invoices/" + invoice_name
invoiceRatio = invoiceImage.offsetHeight / image.height

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


function addBox() {
    if (ctrlSelectedID.length > 0) {
        const label = document.createElement("select")
        const placeholder = document.createElement("input")
        placeholder.setAttribute("type", "checkbox")
        const deleteButton = document.createElement("button")
        deleteButton.onclick = deleteLabelRowBox
        deleteButton.style.width = "80%"
        deleteButton.style.height = "80%"
        deleteButton.innerHTML = "DELETE ROW"
        deleteButton.onmouseenter = labelHover
        deleteButton.onmouseleave = labelHoverOff

        const row = boxTable.insertRow(-1)
        let cell = row.insertCell(0)
        for (let i = 0; i < options.length; i++) {
            const option = document.createElement("option")
            option.value = options[i]
            option.text = options[i]
            label.appendChild(option)
        }
        cell.appendChild(label)

        cell = row.insertCell(1)
        cell.appendChild(placeholder)

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

function deleteLabelRow(e){
    let eID = e.target.id.split('_')[1]
    table.deleteRow(e.target.offsetParent.parentElement.rowIndex)
    arraySelected.splice(arraySelected.indexOf(eID), 1)
}

function deleteLabelRowBox(e){
    boxTable.deleteRow(e.target.offsetParent.parentElement.rowIndex)
}

function labelHover(e){
    e.target.parentNode.parentNode.style.backgroundColor = "red"
}

function labelHoverOff(e){
    e.target.parentNode.parentNode.style.backgroundColor = "white"
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

        if (!arraySelected.includes(eID)) {
            arraySelected.push(eID)
            label_container = document.querySelector(".labels_container")

            const label = document.createElement("select")
            label.id = "label_" + eID
            // const placeholder = document.createElement("input")
            // placeholder.setAttribute("type", "checkbox")
            const deleteButton = document.createElement("button")
            deleteButton.onclick = deleteLabelRow
            deleteButton.style.width = "80%"
            deleteButton.style.height = "80%"
            deleteButton.innerHTML = "DELETE ROW"
            deleteButton.onmouseenter = labelHover
            deleteButton.onmouseleave = labelHoverOff

            const row = table.insertRow(-1)
            row.id = "row_" + eID

            let cell = row.insertCell(0)
            for (let i = 0; i < options.length; i++) {
                const option = document.createElement("option")
                option.value = options[i]
                option.text = options[i]
                label.appendChild(option)
            }
            cell.appendChild(label)

            cell = row.insertCell(1)
            cell.appendChild(placeholder)

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

function export_labels() {
    let values = []
    let labels = []
    let boxes = []
    for (let i = 1; i < table.rows.length; i++) {
        labels.push({
            "field_name": table.rows[i].cells[0].firstChild.value,
            "placeholder": table.rows[i].cells[1].firstChild.checked,
            "left": parseInt(table.rows[i].cells[2].innerHTML),
            "top": parseInt(table.rows[i].cells[3].innerHTML),
            "width": parseInt(table.rows[i].cells[4].innerHTML),
            "height": parseInt(table.rows[i].cells[5].innerHTML),
            "content": table.rows[i].cells[6].innerHTML
        })
    }
    for (let i = 1; i < boxTable.rows.length; i++) {
        boxes.push({
            "field_name": boxTable.rows[i].cells[0].firstChild.value,
            "placeholder": boxTable.rows[i].cells[1].firstChild.checked,
            "left": parseInt(boxTable.rows[i].cells[2].innerHTML),
            "right": parseInt(boxTable.rows[i].cells[3].innerHTML),
            "top": parseInt(boxTable.rows[i].cells[4].innerHTML),
            "bottom": parseInt(boxTable.rows[i].cells[5].innerHTML)
        })
    }
    values.push({
        "labels": labels,
        "boxes": boxes
    })
    console.log(values)
    return JSON.stringify(values)
}

document.addEventListener('DOMContentLoaded', function () {
    for (let i = 0; i < dataLength; i++) {
        const button = document.createElement("button")
        button.id = i
        button.onclick = labelSelected
        let data = data_json[i]
        button.style.cssText = "position: absolute; top: " + data.top * invoiceRatio + "px; left: " + data.left * invoiceRatio + "px; right: 0px; bottom: 0px; width: " + data.width * invoiceRatio + "px; height: " + data.height * invoiceRatio + "px; opacity: 0.3;"
        document.querySelector(".image_container").appendChild(button)
    }
}, false);


