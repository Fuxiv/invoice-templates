const templatesTable = document.getElementById("templatesTable")
let templatesSpliced = JSON.parse(JSON.stringify(templates))
const regexTable = document.getElementById("regexTable")
const fieldsTable = document.getElementById("fieldsTable")
let regexJson = config.regex
let regexSpliced = JSON.parse(JSON.stringify(regexJson))
let fieldsJson = config.fieldValues
let fieldsSpliced = JSON.parse(JSON.stringify(fieldsJson))

// templates table creation
for (let i = 0; i < templates.length; i++) {
    let data = templates[i]

    const invoiceImage = document.createElement("img")
    invoiceImage.src = "/static/invoices/" + data.invoiceName
    invoiceImage.style.height = "150px"
    invoiceImage.style.width = "auto"

    const form = document.createElement("form")
    form.name = "templateAction"
    form.method = "POST"
    form.enctype = "multipart/form-data"
    const index = document.createElement("input")
    const submit = document.createElement("input")
    index.type = "number"
    index.style.display = "none"
    index.name = "index"
    index.value = i
    submit.type = "submit"
    submit.name = "edit_template"
    submit.value = "Edit template"
    submit.style.width = "100%"
    submit.style.textAlign = "center"
    form.appendChild(index)
    form.appendChild(submit)

    const useTemplateButton = document.createElement("button")
    const deleteTemplateButton = document.createElement("button")
    useTemplateButton.innerHTML = "Use template"
    useTemplateButton.style.minWidth = "60px"
    useTemplateButton.style.height = "20px"
    useTemplateButton.style.marginBottom = "5px"
    useTemplateButton.type = "submit"
    useTemplateButton.setAttribute("form", "fileForm")
    useTemplateButton.name = "use"
    useTemplateButton.value = i

    deleteTemplateButton.onclick = deleteTemplate
    deleteTemplateButton.innerHTML = "Delete template"
    deleteTemplateButton.style.minWidth = "60px"
    deleteTemplateButton.style.height = "20px"
    deleteTemplateButton.style.marginTop = "5px"

    let row = templatesTable.insertRow(-1)
    row.style.height = "160px"
    let cell = row.insertCell(0)
    cell.innerHTML = i

    cell = row.insertCell(1)
    cell.innerHTML = data.tempName

    cell = row.insertCell(2)
    cell.innerHTML = data.invoiceName

    cell = row.insertCell(3)
    cell.appendChild(invoiceImage)

    cell = row.insertCell(4)
    cell.style.height = "160px"
    cell.style.display = "flex"
    cell.style.flexDirection = "column"
    cell.style.justifyContent = "center"
    cell.style.alignContent = "center"
    cell.appendChild(useTemplateButton)
    cell.appendChild(form)
    cell.appendChild(deleteTemplateButton)
}

//regex table creation
for (let i = 0; i < regexJson.length; i++) {
    let currentRegex = regexJson[i]
    let field = document.createElement("input")

    let row = regexTable.insertRow(-1)

    let cell = row.insertCell(0)
    field.value = currentRegex.name
    cell.appendChild(field)

    field = document.createElement("input")
    cell = row.insertCell(1)
    field.value = currentRegex.regex
    cell.appendChild(field)

    field = document.createElement("input")
    cell = row.insertCell(2)
    field.value = currentRegex.retrieve
    cell.appendChild(field)

    const type = document.createElement("select")
    let option = document.createElement("option")
    option.value = "string"
    option.text = "String"
    type.appendChild(option)
    option = document.createElement("option")
    option.value = "int"
    option.text = "Number"
    type.appendChild(option)
    cell = row.insertCell(3)
    cell.appendChild(type)

    const deleteButton = document.createElement("button")
    deleteButton.onclick = deleteRegex
    deleteButton.innerHTML = "Delete"
    cell = row.insertCell(4)
    cell.appendChild(deleteButton)
}

//fields table creation
for (let i = 0; i < fieldsJson.length; i++) {
    const row = fieldsTable.insertRow(-1)

    const field = document.createElement("input")
    let cell = row.insertCell(0)
    field.value = fieldsJson[i]
    cell.appendChild(field)

    const deleteButton = document.createElement("button")
    deleteButton.onclick = deleteField
    deleteButton.innerHTML = "Delete"
    cell = row.insertCell(1)
    cell.appendChild(deleteButton)
}


function deleteTemplate(e) {
    templatesSpliced.splice(e.target.parentElement.parentElement.rowIndex, 1)
    templatesTable.deleteRow(e.target.parentElement.parentElement.rowIndex)
    updateIndexes(templatesTable)
}

function deleteRegex(e) {
    regexSpliced.splice(e.target.parentElement.parentElement.rowIndex, 1)
    regexTable.deleteRow(e.target.parentElement.parentElement.rowIndex)
}

function saveTemplates() {
    fetch('/template/update', {
        method: "POST", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify(templatesSpliced)
    }).then(response => response.json())
        .then(data => {
            // reset templateIndex
            updateIndexesOnSave()
            console.log(data)
        })
        .catch((error) => {
            console.error(error)
        })
}

function updateIndexes(table) {
    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].cells[0].innerHTML = i
    }
}

function updateIndexesOnSave() {
    for (let i = 0; i < templatesTable.rows.length; i++) {
        templatesTable.rows[i].cells[4].children[1].children.index.value = i
    }
}

function createRegex() {
    const lastCell = regexTable.rows[regexTable.rows.length - 1]
    if (lastCell.cells[0].firstChild.value === '' || lastCell.cells[1].firstChild.value === '' || lastCell.cells[2].firstChild.value === '') {
        return
    }
    const row = regexTable.insertRow(-1)

    let cell = row.insertCell(0)
    cell.appendChild(document.createElement("input"))

    cell = row.insertCell(1)
    cell.appendChild(document.createElement("input"))

    cell = row.insertCell(2)
    cell.appendChild(document.createElement("input"))

    const type = document.createElement("select")
    let option = document.createElement("option")
    option.value = "string"
    option.text = "String"
    type.appendChild(option)
    option = document.createElement("option")
    option.value = "int"
    option.text = "Number"
    type.appendChild(option)
    cell = row.insertCell(3)
    cell.appendChild(type)

    const deleteButton = document.createElement("button")
    deleteButton.onclick = deleteRegex
    deleteButton.innerHTML = "Delete"
    cell = row.insertCell(4)
    cell.appendChild(deleteButton)
}

function saveConfig() {
    let output = []
    for (let i = 1; i < regexTable.rows.length; i++) {
        let currentRow = regexTable.rows[i]
        if (currentRow.cells[0].firstChild.value !== '' || currentRow.cells[1].firstChild.value !== '' || currentRow.cells[2].firstChild.value !== '') {
            output.push({
                "name": currentRow.cells[0].firstChild.value,
                "regex": currentRow.cells[1].firstChild.value,
                "retrieve": currentRow.cells[2].firstChild.value,
                "type": currentRow.cells[3].firstChild.value
            })
        }
    }
    config.regex = output
    output = []
    for (let i = 1; i < fieldsTable.rows.length; i++) {
        if (fieldsTable.rows[i].cells[0].firstChild.value !== '') {
            output.push(fieldsTable.rows[i].cells[0].firstChild.value)
        }
    }
    config.fieldValues = output
    fetch('/config/update', {
        method: "POST", headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify(config)
    }).then(response => response.json())
        .then(data => {
            // console.log(data)
        })
        .catch((error) => {
            console.error(error)
        })
}

function createField() {
    if (fieldsTable.rows[fieldsTable.rows.length - 1].cells[0].firstChild.value !== '') {
        const row = fieldsTable.insertRow(-1)

        const field = document.createElement("input")
        let cell = row.insertCell(0)
        cell.appendChild(field)

        const deleteButton = document.createElement("button")
        deleteButton.onclick = deleteField
        deleteButton.innerHTML = "Delete"
        cell = row.insertCell(1)
        cell.appendChild(deleteButton)
    }
}

function deleteField(e) {
    console.log(e)
    fieldsTable.deleteRow(e.target.parentElement.parentElement.rowIndex)
}