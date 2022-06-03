let headerCell = document.getElementById("header-cell")
let headerPos = {x:null, y:null}

let speedMS = 50
const instrucciones = ["MoverArriba", "MoverAbajo", "MoverIzquierda", "MoverDerecha", "Limpiar", "PintarNegro", "PintarVerde", "PintarRojo"]
let procedimientos = {}

/*
PintarNegro
MoverDerecha
PintarNegro
MoverDerecha
PintarNegro
MoverDerecha
PintarNegro
MoverAbajo
PintarNegro
MoverIzquierda
PintarNegro
MoverIzquierda
PintarNegro
MoverIzquierda
PintarNegro
MoverAbajo
PintarNegro
MoverDerecha
PintarNegro
MoverDerecha
PintarNegro
MoverDerecha
PintarNegro
MoverAbajo
PintarNegro
MoverIzquierda
PintarNegro
MoverIzquierda
PintarNegro
MoverIzquierda
PintarNegro
MoverArriba
MoverArriba
MoverArriba
 */
function sleep(ms){
    return new Promise((resolve)=> setTimeout(resolve, ms))
}
async function run(code){
    console.log(code)
    let line = ""
    try{
        let lines = code.split("\n")
        for (let i = 0; i < lines.length; i++) {
            line = lines[i].trim()
            if(shouldRunLine(line)){
                if(!isSyntaxError(line)){
                    if(instrucciones.includes(line)){
                        document.dispatchEvent(new Event(line))
                    }
                    else if(procedimientos[line.slice(0, line.indexOf("("))]){
                        document.dispatchEvent(new Event(line.slice(0, line.indexOf("("))))
                    }
                    else if(line.startsWith("repetir")){
                        await repeat(lines, i)
                    }

                    await sleep(speedMS).then(()=>{})
                }
                else{
                    console.log("Linea de QDraw invalida, ejecucion frenada.")
                    return
                }
            }
        }
    }
    catch(err){
        console.error(`No se pudo correr el QDraw, hubo un error en la linea "${line}". ${err}`)
    }
}
async function repeat(lines, startIndex){
    let totalLines = lines.slice(startIndex, lines.length)
    let iterations = parseInt(totalLines[0].split("repetir ")[1].split(" veces")[0])
    let until = findBrackeysEnd(totalLines)
    
    totalLines = totalLines.slice(1, until)
    console.log(totalLines)
    for (let i = 0; i < iterations; i++) {
        for (const line of totalLines) {
            await run(line).then(()=>{})
        }  
    }
}
function findBrackeysEnd(totalLines){
    for(let i = 0; i < totalLines.length; i++){
        const line = totalLines[i]
        if(line == "}"){
            return i
        }
    }
    throw new Error("No se cerraron las llaves correctamente")
}
function shouldRunLine(line){
    if(line.startsWith("/*") || line.startsWith("*") || line.endsWith("*/") || line.startsWith("}"))
        return false
    return true
}
function isSyntaxError(line){
    if(!instrucciones.includes(line)){
        let firstParenthesisIndex = line.indexOf("(")
        let secondParenthesisIndex = line.indexOf(")")

        if(!procedimientos[(line.slice(0, firstParenthesisIndex)) || secondParenthesisIndex - firstParenthesisIndex != 1]){
            if(line.startsWith("repetir ") && line.includes(" veces") && line.endsWith("{"))
                return false
            alert(`La linea "${line}" no es una instruccion o procedimiento válido.`)
            return true
        }
        else if(line.includes(" ")){
            if(line.startsWith("repetir ") && line.includes(" veces") && line.endsWith("{"))
                return false
            alert(`La linea "${line}" contiene espacios dentro de la instruccion.`)
            return true
        }
    }
    return false
}
function gridAt({x, y}){
    try{
        let row = document.getElementsByClassName("row")
        if(row) row = row[y]
        else throw new Error(`No hay ningula fila en ${y}`)
        let cell = row.getElementsByClassName("cell")
        if(cell) cell = cell[x]
        else throw new Error(`No hay ningula celda en (${x},${y})`)
        return cell
    }
    catch(err){
        console.error(err)
    }
}
function move({x, y}){
    try{
        let newCell= gridAt({x: headerPos.x + x, y: headerPos.y + y})
        if(newCell){
            headerCell.id = ""
            headerCell = newCell
            headerCell.id = "header-cell"
            headerPos = {x: headerPos.x + x, y: headerPos.y + y}
        }
        else{
            throw new Error(`(${headerPos.x + x},${headerPos.y + y}) is out of bounds.`)
        }
    }
    catch(err){
        alert(`Movimiento inválido. No puedes ir a (${headerPos.x + x}, ${headerPos.y + y}).`)
        console.error(err)
    }
}
function clearHeader(){
    headerCell.className = "cell"
}
function paintHeader(color){
    headerCell.className = `cell ${color}`
}
function loadEvents(){
    document.getElementById("create-grid").addEventListener("click", e=>{
        e.preventDefault()
        let width = parseInt(document.getElementById("create-width").value)
        let height = parseInt(document.getElementById("create-height").value)
    
        let gridContainer = document.getElementById("grid-container")
        gridContainer.innerHTML = ""
    
        for (let row = 0; row < height; row++) {
            let activeRow= document.createElement("div")
            activeRow.className = "row"
    
            for (let cell = 0; cell < width; cell++) {
                let activeCell = document.createElement("span")
                activeCell.className="cell"
                activeCell.setAttribute("data-x", cell)
                activeCell.setAttribute("data-y", row)
    
    
                activeRow.appendChild(activeCell)
            }
            
            gridContainer.appendChild(activeRow)
        }
    
        if(headerCell) headerCell.id = ""
        headerCell = gridAt({x:0, y:0})
        headerCell.id = "header-cell"
    
        cellEvents()
    })
    
}
function cellEvents(){
    let cells = document.getElementsByClassName("cell")
    for (const cell of cells) {
        cell.addEventListener("click", e=>{
            if(headerCell) headerCell.id = ""
            cell.id = "header-cell"
            headerCell = cell
            headerPos.x = parseInt(cell.getAttribute("data-x"))
            headerPos.y = parseInt(cell.getAttribute("data-y"))
            console.log(headerPos)
        })
    }
}
function headerButtonEvents(){
    document.getElementById("MoverArriba").addEventListener("click", (e)=>{document.dispatchEvent(new Event("MoverArriba"))})
    document.getElementById("MoverAbajo").addEventListener("click", (e)=>{document.dispatchEvent(new Event("MoverAbajo"))})
    document.getElementById("MoverIzquierda").addEventListener("click", (e)=>{document.dispatchEvent(new Event("MoverIzquierda"))})
    document.getElementById("MoverDerecha").addEventListener("click", (e)=>{document.dispatchEvent(new Event("MoverDerecha"))})
    document.getElementById("Limpiar").addEventListener("click", (e)=>{document.dispatchEvent(new Event("Limpiar"))})
    document.getElementById("PintarNegro").addEventListener("click", (e)=>{document.dispatchEvent(new Event("PintarNegro"))})
    document.getElementById("PintarRojo").addEventListener("click", (e)=>{document.dispatchEvent(new Event("PintarRojo"))})
    document.getElementById("PintarVerde").addEventListener("click", (e)=>{document.dispatchEvent(new Event("PintarVerde"))})
    
    document.addEventListener("MoverArriba", (e)=>{move({x:0,y:-1})})
    document.addEventListener("MoverAbajo", (e)=>{move({x:0,y:1})})
    document.addEventListener("MoverIzquierda", (e)=>{move({x:-1,y:0})})
    document.addEventListener("MoverDerecha", (e)=>{move({x:1,y:0})}, false)
    document.addEventListener("Limpiar", (e)=>{clearHeader()}, false)
    document.addEventListener("PintarVerde", (e)=>{paintHeader("green")}, false)
    document.addEventListener("PintarRojo", (e)=>{paintHeader("red")}, false)
    document.addEventListener("PintarNegro", (e)=>{paintHeader("black")}, false)
    
}
function isValidProcedure(name){
    if(procedimientos[name]){
        alert("El Procedimiento" + name + "ya existe.")
        return false
    }
    else if(name.includes(" ")){
        alert("El procedimiento" + name + "no puede contener espacios.")
        return false
    }
    else if(instrucciones.includes(name)){
        alert("El procedimiento" + name + "ya es una instruccion basica")
        return false
    }
    return true
}
function addProcedure(name){
    const proceduresContainer = document.getElementById("procedimientos")
    if(!isValidProcedure(name)) return

    let newProcedimiento = document.createElement("div")
    newProcedimiento.id = name
    newProcedimiento.className = "procedimiento"
    newProcedimiento.innerHTML = `
        procedimiento ${name}(){
            <br>
            <textarea class="instructions" oninput='this.style.height = "5px";this.style.height = (this.scrollHeight)+"px";'></textarea>
            <br>
        }
    `
    let borrarProcedimiento = document.createElement("button")
    borrarProcedimiento.innerText = "Borrar Procedimiento"
    borrarProcedimiento.value = "Borrar Procedimiento"
    borrarProcedimiento.addEventListener("click", (e)=>{deleteProcedure(name)})
    
    procedimientos[name] = ()=>{
        run(document.getElementById(name).getElementsByClassName("instructions")[0].value)
    }
    document.addEventListener(name, procedimientos[name])

    newProcedimiento.appendChild(borrarProcedimiento)
    proceduresContainer.appendChild(newProcedimiento)
}
function deleteProcedure(name){
    document.getElementById(name).remove()
    document.removeEventListener(name, procedimientos[name])
    delete procedimientos[name]
}
function procedureButtonEvents(){
    document.getElementById("btn-add-procedimiento").addEventListener("click", (e)=>{
        const NAME = document.getElementById("add-procedimiento-name").value
        addProcedure(NAME)
    })
}
function programEvents(){
    document.getElementById("programa-run").addEventListener("click", (e)=>{run(document.getElementById("programa-instrucciones").value)})
}
function exportEvents(){
    document.getElementById("generate-text").addEventListener("click", exportTxt)
}
function addEvents(){
    loadEvents()
    procedureButtonEvents()
    headerButtonEvents()
    programEvents()
    exportEvents()
}
function exportTxt(){
    const outputContainer = document.getElementById("output-txt")
    let output = ""

    let programText = document.getElementById("programa-instrucciones").value
    output += `
        programa {
            ${programText}
        }
    `    

    for (const key in procedimientos) {
        let procedimientoText = document.getElementById(key).getElementsByClassName("instructions")[0].value
        output += `procedimiento ${key}(){
            ${procedimientoText}
        }
        `
    }

    outputContainer.innerText = output
}

addEvents()