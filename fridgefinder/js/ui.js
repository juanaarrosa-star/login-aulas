// ui.js — solo dibuja. No sabe que existe una API.

export function mostrar(elemento) {
    elemento.style.display = "block"
}

export function ocultar(elemento) {
    elemento.style.display = "none"
}

export function mensaje(elemento, texto) {
    elemento.textContent = texto
}

// Dibuja los ingredientes ya agregados como "chips" con una cruz para sacarlos.
export function renderChips(contenedor, ingredientes) {
    contenedor.innerHTML = ""

    ingredientes.forEach((ingrediente, indice) => {
        contenedor.innerHTML += `
            <span class="chip">
                ${ingrediente}
                <button class="btnSacarChip" data-indice="${indice}">✕</button>
            </span>`
    })
}

// Dibuja el listado de recetas encontradas (la "receta resumida": id, nombre, imagen),
// con un botón de guardar en cada card. idsGuardados es un array de ids (strings)
// de las recetas que ya están guardadas, para saber qué ícono mostrar en cada una.
export function renderListado(contenedor, recetas, idsGuardados) {
    contenedor.innerHTML = ""

    if (recetas.length === 0) {
        contenedor.innerHTML = "<p>No encontramos recetas con esos ingredientes.</p>"
        return
    }

    recetas.forEach(receta => {
        const estaGuardada = idsGuardados.find(id => id === receta.id)
        const iconoGuardar = estaGuardada ? "img/guardado.png" : "img/sin-guardar.png"

        contenedor.innerHTML += `
            <div class="card" data-id="${receta.id}">
                <img src="${receta.imagen}" alt="${receta.nombre}">
                <h3>${receta.nombre}</h3>
                <button class="btnGuardar" data-id="${receta.id}">
                    <img src="${iconoGuardar}" alt="Guardar receta" class="iconoGuardar">
                </button>
            </div>`
    })
}

// Flechas dibujadas con SVG (en vez de usar el caracter "←"/"→").
const flechaIzquierda = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
const flechaDerecha = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'

// Dibuja los botones de paginación: Anterior / Página X de Y / Siguiente.
export function renderPaginacion(contenedor, paginaActual, totalPaginas) {
    const deshabilitarAnterior = paginaActual <= 1 ? "disabled" : ""
    const deshabilitarSiguiente = paginaActual >= totalPaginas ? "disabled" : ""

    contenedor.innerHTML = `
        <button id="btnPaginaAnterior" ${deshabilitarAnterior}>${flechaIzquierda} Anterior</button>
        <span>Página ${paginaActual} de ${totalPaginas}</span>
        <button id="btnPaginaSiguiente" ${deshabilitarSiguiente}>Siguiente ${flechaDerecha}</button>`
}

// Dibuja el detalle completo de una receta, con su botón de guardar.
export function renderDetalle(contenedor, receta, estaGuardada) {
    // Armamos la lista de ingredientes como <li> a partir del array
    let listaIngredientes = ""
    receta.ingredientes.forEach(ingrediente => {
        listaIngredientes += `<li>${ingrediente}</li>`
    })

    const iconoGuardar = estaGuardada ? "img/guardado.png" : "img/sin-guardar.png"

    contenedor.innerHTML = `
        <img src="${receta.imagen}" alt="${receta.nombre}">
        <button class="btnGuardar" data-id="${receta.id}">
            <img src="${iconoGuardar}" alt="Guardar receta" class="iconoGuardar">
        </button>
        <h1>${receta.nombre}</h1>
        <p>Categoría: ${receta.categoria} · Origen: ${receta.pais}</p>

        <h2>Ingredientes</h2>
        <ul>${listaIngredientes}</ul>

        <h2>Preparación</h2>
        <p>${receta.instrucciones}</p>

        <a href="${receta.video}" target="_blank">Ver video</a>`
}
