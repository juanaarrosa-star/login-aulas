// main.js — conecta el HTML con las funciones de api.js y ui.js.
import { buscarRecetasPorIngredientes, obtenerRecetaCompleta, obtenerRecetasPorPais } from "./api.js"
import { mostrar, ocultar, mensaje, renderChips, renderListado, renderPaginacion, renderDetalle } from "./ui.js"

const btnMenu = document.querySelector("#btnMenu")
const menuHamburguesa = document.querySelector("#menuHamburguesa")

const divBusqueda = document.querySelector("#busqueda")
const inpIngrediente = document.querySelector("#ingrediente")
const btnAgregarIngrediente = document.querySelector("#btnAgregarIngrediente")
const divChips = document.querySelector("#chips")
const btnBuscar = document.querySelector("#btnBuscar")
const btnVaciar = document.querySelector("#btnVaciar")
const pMensaje = document.querySelector("#mensaje")
const divResultados = document.querySelector("#resultados")
const divPaginacion = document.querySelector("#paginacion")

const inputPais = document.querySelector("#inputPais")
const btnFiltrarPais = document.querySelector("#btnFiltrarPais")
const selectTamanioPagina = document.querySelector("#selectTamanioPagina")

const divDetalle = document.querySelector("#detalle")
const divDetalleContenido = document.querySelector("#detalleContenido")

const divGuardadas = document.querySelector("#guardadas")
const divListaGuardadas = document.querySelector("#listaGuardadas")

const divPerfil = document.querySelector("#perfil")
const divAyuda = document.querySelector("#ayuda")
const divAjustes = document.querySelector("#ajustes")

// Todas las "pantallas" de la SPA, para poder mostrar una sola y esconder el resto.
const pantallas = [
    { nombre: "busqueda", elemento: divBusqueda },
    { nombre: "detalle", elemento: divDetalle },
    { nombre: "guardadas", elemento: divGuardadas },
    { nombre: "perfil", elemento: divPerfil },
    { nombre: "ayuda", elemento: divAyuda },
    { nombre: "ajustes", elemento: divAjustes }
]

function mostrarPantalla(nombre) {
    pantallas.forEach(pantalla => {
        if (pantalla.nombre === nombre) {
            mostrar(pantalla.elemento)
        } else {
            ocultar(pantalla.elemento)
        }
    })
}

// Acá guardamos, mientras el usuario va escribiendo, los ingredientes
// que agregó. Es un array simple de strings, ej: ["pollo", "tomate"].
let ingredientesIngresados = []

// Resultado de la última búsqueda por ingredientes (sin filtrar por país).
let resultadosBusqueda = []
// Lo mismo, pero después de aplicar el filtro de país (esto es lo que se pagina).
let resultadosFiltrados = []

let paginaActual = 1
let tamanioPagina = 10

// Recetas guardadas por el usuario (solo mientras la página esté abierta:
// no vimos en clase cómo guardar datos permanentemente en el navegador).
let recetasGuardadas = []

// Receta que se está mostrando en la pantalla de detalle (o null si no hay ninguna).
let recetaActualDetalle = null

// --- helpers ---

// Sube desde "elemento" por sus padres hasta encontrar uno con la clase pedida.
function buscarAncestroConClase(elemento, clase) {
    while (elemento !== null && !elemento.classList.contains(clase)) {
        elemento = elemento.parentElement
    }
    return elemento
}

function calcularTotalPaginas(cantidadItems, tamanio) {
    if (cantidadItems === 0) {
        return 1
    }

    let totalPaginas = 0
    for (let i = 0; i < cantidadItems; i += tamanio) {
        totalPaginas = totalPaginas + 1
    }
    return totalPaginas
}

// Devuelve solo los items que corresponden a la página pedida.
function obtenerPagina(lista, pagina, tamanio) {
    const inicio = (pagina - 1) * tamanio
    const fin = inicio + tamanio
    return lista.filter((item, indice) => indice >= inicio && indice < fin)
}

function actualizarListado() {
    const totalPaginas = calcularTotalPaginas(resultadosFiltrados.length, tamanioPagina)

    if (paginaActual > totalPaginas) {
        paginaActual = totalPaginas
    }
    if (paginaActual < 1) {
        paginaActual = 1
    }

    const paginaDeRecetas = obtenerPagina(resultadosFiltrados, paginaActual, tamanioPagina)
    const idsGuardados = recetasGuardadas.map(receta => receta.id)

    renderListado(divResultados, paginaDeRecetas, idsGuardados)
    renderPaginacion(divPaginacion, paginaActual, totalPaginas)
}

function actualizarVistaGuardadas() {
    const idsGuardados = recetasGuardadas.map(receta => receta.id)
    renderListado(divListaGuardadas, recetasGuardadas, idsGuardados)
}

// Aplica el texto de inputPais sobre resultadosBusqueda y vuelve a pintar el listado.
async function aplicarFiltroPais() {
    const paisTexto = inputPais.value.trim()

    if (paisTexto === "") {
        resultadosFiltrados = resultadosBusqueda
        paginaActual = 1
        actualizarListado()
        return
    }

    try {
        mensaje(pMensaje, "Filtrando por país...")
        const recetasDelPais = await obtenerRecetasPorPais(paisTexto)

        resultadosFiltrados = resultadosBusqueda.filter(receta => {
            return recetasDelPais.find(r => r.id === receta.id)
        })

        mensaje(pMensaje, "")
        paginaActual = 1
        actualizarListado()
    } catch (error) {
        mensaje(pMensaje, error.message)
    }
}

// Guarda o saca una receta de recetasGuardadas, y refresca todas las vistas que la muestran.
function alternarGuardado(id) {
    const yaGuardada = recetasGuardadas.find(receta => receta.id === id)

    if (yaGuardada) {
        recetasGuardadas = recetasGuardadas.filter(receta => receta.id !== id)
    } else {
        let receta = resultadosBusqueda.find(r => r.id === id)
        if (receta === undefined && recetaActualDetalle !== null && recetaActualDetalle.id === id) {
            receta = recetaActualDetalle
        }

        if (receta !== undefined) {
            recetasGuardadas.push({ id: receta.id, nombre: receta.nombre, imagen: receta.imagen })
        }
    }

    actualizarListado()
    actualizarVistaGuardadas()

    if (recetaActualDetalle !== null && recetaActualDetalle.id === id) {
        const estaGuardada = recetasGuardadas.find(r => r.id === id) !== undefined
        renderDetalle(divDetalleContenido, recetaActualDetalle, estaGuardada)
    }
}

async function abrirDetalle(id) {
    try {
        const receta = await obtenerRecetaCompleta(id)
        recetaActualDetalle = receta

        const estaGuardada = recetasGuardadas.find(r => r.id === id) !== undefined
        renderDetalle(divDetalleContenido, receta, estaGuardada)

        mostrarPantalla("detalle")
    } catch (error) {
        mensaje(pMensaje, error.message)
    }
}

// --- menú hamburguesa ---

btnMenu.addEventListener("click", () => {
    if (menuHamburguesa.style.display === "block") {
        ocultar(menuHamburguesa)
    } else {
        mostrar(menuHamburguesa)
    }
})

menuHamburguesa.addEventListener("click", (evento) => {
    const itemMenu = buscarAncestroConClase(evento.target, "itemMenu")
    if (itemMenu === null) {
        return
    }

    const destino = itemMenu.dataset.destino
    mostrarPantalla(destino)
    ocultar(menuHamburguesa)

    if (destino === "guardadas") {
        actualizarVistaGuardadas()
    }
})

document.querySelectorAll(".btnVolverMenu").forEach(boton => {
    boton.addEventListener("click", () => mostrarPantalla("busqueda"))
})

// --- ingredientes ---

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
    resultadosBusqueda = []
    resultadosFiltrados = []
    paginaActual = 1
    inputPais.value = ""

    renderChips(divChips, ingredientesIngresados)
    actualizarListado()
    mensaje(pMensaje, "")
})

btnBuscar.addEventListener("click", async () => {
    if (ingredientesIngresados.length === 0) {
        mensaje(pMensaje, "Agregá al menos un ingrediente")
        return
    }

    try {
        mensaje(pMensaje, "Buscando recetas...")
        resultadosBusqueda = await buscarRecetasPorIngredientes(ingredientesIngresados)
        mensaje(pMensaje, "")
        await aplicarFiltroPais()
    } catch (error) {
        mensaje(pMensaje, error.message)
    }
})

// --- filtro de país ---

btnFiltrarPais.addEventListener("click", async () => {
    await aplicarFiltroPais()
})

// --- paginación ---

selectTamanioPagina.addEventListener("change", () => {
    tamanioPagina = Number(selectTamanioPagina.value)
    paginaActual = 1
    actualizarListado()
})

divPaginacion.addEventListener("click", (evento) => {
    if (evento.target.id === "btnPaginaAnterior") {
        paginaActual = paginaActual - 1
        actualizarListado()
    } else if (evento.target.id === "btnPaginaSiguiente") {
        paginaActual = paginaActual + 1
        actualizarListado()
    }
})

// --- listado de resultados: guardar o abrir detalle ---

divResultados.addEventListener("click", async (evento) => {
    const botonGuardar = buscarAncestroConClase(evento.target, "btnGuardar")
    if (botonGuardar !== null) {
        alternarGuardado(botonGuardar.dataset.id)
        return
    }

    const card = buscarAncestroConClase(evento.target, "card")
    if (card === null) {
        return
    }

    await abrirDetalle(card.dataset.id)
})

// --- listado de recetas guardadas: guardar/sacar o abrir detalle ---

divListaGuardadas.addEventListener("click", async (evento) => {
    const botonGuardar = buscarAncestroConClase(evento.target, "btnGuardar")
    if (botonGuardar !== null) {
        alternarGuardado(botonGuardar.dataset.id)
        return
    }

    const card = buscarAncestroConClase(evento.target, "card")
    if (card === null) {
        return
    }

    await abrirDetalle(card.dataset.id)
})

// --- detalle: guardar desde la pantalla de la receta completa ---

divDetalleContenido.addEventListener("click", (evento) => {
    const botonGuardar = buscarAncestroConClase(evento.target, "btnGuardar")
    if (botonGuardar !== null) {
        alternarGuardado(botonGuardar.dataset.id)
    }
})

actualizarListado()
