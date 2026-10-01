// main.js — conecta el HTML con las funciones de api.js y ui.js.
import { buscarRecetasPorIngredientes, obtenerRecetaCompleta } from "./api.js"
import { mostrar, ocultar, mensaje, renderChips, renderListado, renderDetalle } from "./ui.js"

const divBusqueda = document.querySelector("#busqueda")
const inpIngrediente = document.querySelector("#ingrediente")
const btnAgregarIngrediente = document.querySelector("#btnAgregarIngrediente")
const divChips = document.querySelector("#chips")
const btnBuscar = document.querySelector("#btnBuscar")
const btnVaciar = document.querySelector("#btnVaciar")
const pMensaje = document.querySelector("#mensaje")
const divResultados = document.querySelector("#resultados")

const divDetalle = document.querySelector("#detalle")
const btnVolver = document.querySelector("#btnVolver")
const divDetalleContenido = document.querySelector("#detalleContenido")

// Acá guardamos, mientras el usuario va escribiendo, los ingredientes
// que agregó. Es un array simple de strings, ej: ["pollo", "tomate"].
let ingredientesIngresados = []

btnAgregarIngrediente.addEventListener("click", () => {
    const ingrediente = inpIngrediente.value.trim()

    if (ingrediente === "") {
        return
    }

    ingredientesIngresados.push(ingrediente)
    renderChips(divChips, ingredientesIngresados)
    inpIngrediente.value = ""
})

// Delegación de eventos: escuchamos el contenedor de chips, y si el click
// fue en el botón de sacar (✕), borramos ese ingrediente del array.
divChips.addEventListener("click", (evento) => {
    if (!evento.target.classList.contains("btnSacarChip")) {
        return
    }

    const indice = Number(evento.target.dataset.indice)
    ingredientesIngresados = ingredientesIngresados.filter((ingrediente, i) => i !== indice)
    renderChips(divChips, ingredientesIngresados)
})

// Vacía la lista de ingredientes y los resultados, para arrancar de cero.
btnVaciar.addEventListener("click", () => {
    ingredientesIngresados = []
    renderChips(divChips, ingredientesIngresados)
    renderListado(divResultados, [])
    mensaje(pMensaje, "")
})

btnBuscar.addEventListener("click", async () => {
    if (ingredientesIngresados.length === 0) {
        mensaje(pMensaje, "Agregá al menos un ingrediente")
        return
    }

    try {
        mensaje(pMensaje, "Buscando recetas...")
        const recetas = await buscarRecetasPorIngredientes(ingredientesIngresados)
        mensaje(pMensaje, "")
        renderListado(divResultados, recetas)
    } catch (error) {
        mensaje(pMensaje, error.message)
    }
})

// Delegación de eventos sobre el listado de resultados: si el click fue
// adentro de una card (en la imagen, el título, o la card misma), subimos
// hasta encontrar el div.card para leer su data-id.
divResultados.addEventListener("click", async (evento) => {
    let elemento = evento.target

    while (elemento !== null && !elemento.classList.contains("card")) {
        elemento = elemento.parentElement
    }

    if (elemento === null) {
        return
    }

    const id = elemento.dataset.id

    try {
        const receta = await obtenerRecetaCompleta(id)
        renderDetalle(divDetalleContenido, receta)

        ocultar(divBusqueda)
        mostrar(divDetalle)
    } catch (error) {
        mensaje(pMensaje, error.message)
    }
})

btnVolver.addEventListener("click", () => {
    ocultar(divDetalle)
    mostrar(divBusqueda)
})
