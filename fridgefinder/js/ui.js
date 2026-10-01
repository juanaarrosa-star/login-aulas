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

// Dibuja el listado de recetas encontradas (la "receta resumida": id, nombre, imagen).
export function renderListado(contenedor, recetas) {
    contenedor.innerHTML = ""

    if (recetas.length === 0) {
        contenedor.innerHTML = "<p>No encontramos recetas con esos ingredientes.</p>"
        return
    }

    recetas.forEach(receta => {
        contenedor.innerHTML += `
            <div class="card" data-id="${receta.id}">
                <img src="${receta.imagen}" alt="${receta.nombre}">
                <h3>${receta.nombre}</h3>
            </div>`
    })
}

// Dibuja el detalle completo de una receta.
export function renderDetalle(contenedor, receta) {
    // Armamos la lista de ingredientes como <li> a partir del array
    let listaIngredientes = ""
    receta.ingredientes.forEach(ingrediente => {
        listaIngredientes += `<li>${ingrediente}</li>`
    })

    contenedor.innerHTML = `
        <img src="${receta.imagen}" alt="${receta.nombre}">
        <h1>${receta.nombre}</h1>
        <p>Categoría: ${receta.categoria} · Origen: ${receta.pais}</p>

        <h2>Ingredientes</h2>
        <ul>${listaIngredientes}</ul>

        <h2>Preparación</h2>
        <p>${receta.instrucciones}</p>

        <a href="${receta.video}" target="_blank">Ver video</a>`
}
