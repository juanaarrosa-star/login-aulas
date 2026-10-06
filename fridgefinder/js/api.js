// api.js — todos los pedidos a TheMealDB viven acá.
const BASE_URL = "https://www.themealdb.com/api/json/v1/1"

// --- buscar recetas por UN ingrediente ---
export async function obtenerRecetasPorIngrediente(ingrediente) {
    const respuesta = await fetch(`${BASE_URL}/filter.php?i=${ingrediente}`)
    if (!respuesta.ok) {
        throw new Error("No pudimos buscar recetas")
    }

    const datos = await respuesta.json()

    // TheMealDB devuelve "meals": null (no un array vacío) cuando no encuentra nada
    if (datos.meals === null) {
        return []
    }

    // Transformamos cada receta "cruda" de la API en nuestra "receta resumida"
    // (esto es lo que documentamos en el esquema de datos de la preentrega 2)
    return datos.meals.map(meal => {
        return {
            id: meal.idMeal,
            nombre: meal.strMeal,
            imagen: meal.strMealThumb
        }
    })
}

// --- buscar recetas por VARIOS ingredientes, combinando los resultados ---
// filter.php solo acepta un ingrediente a la vez, así que pedimos uno por uno
// y después cruzamos los resultados acá, contando cuántos ingredientes
// coinciden en cada receta encontrada.
export async function buscarRecetasPorIngredientes(ingredientes) {
    const encontradas = []   // cada item: { receta, veces }

    for (let i = 0; i < ingredientes.length; i++) {
        const recetas = await obtenerRecetasPorIngrediente(ingredientes[i])

        recetas.forEach(receta => {
            const yaEsta = encontradas.find(item => item.receta.id === receta.id)

            if (yaEsta) {
                yaEsta.veces = yaEsta.veces + 1
            } else {
                encontradas.push({ receta: receta, veces: 1 })
            }
        })
    }

    // Priorizamos las recetas que coinciden con TODOS los ingredientes
    // ingresados, y dejamos el resto (coincidencia parcial) después.
    const coincidenTodos = encontradas.filter(item => item.veces === ingredientes.length)
    const coincidenAlgunos = encontradas.filter(item => item.veces < ingredientes.length)

    const ordenadas = []
    coincidenTodos.forEach(item => ordenadas.push(item))
    coincidenAlgunos.forEach(item => ordenadas.push(item))

    return ordenadas.map(item => item.receta)
}

// --- buscar recetas por país de origen (ej: "Spanish", "Mexican", "Italian") ---
// TheMealDB guarda el país en inglés, con la primera letra en mayúscula
// (ej: "Spanish", no "España"). Para que no importe cómo lo escriba el
// usuario (ESPAÑOL, español, Español...), lo normalizamos nosotros antes
// de mandarlo a la API.
export async function obtenerRecetasPorPais(pais) {
    const paisNormalizado = capitalizarPrimeraLetra(pais)
    const respuesta = await fetch(`${BASE_URL}/filter.php?a=${paisNormalizado}`)
    if (!respuesta.ok) {
        throw new Error("No pudimos buscar recetas por país")
    }

    const datos = await respuesta.json()

    if (datos.meals === null) {
        return []
    }

    return datos.meals.map(meal => {
        return {
            id: meal.idMeal,
            nombre: meal.strMeal,
            imagen: meal.strMealThumb
        }
    })
}

// Convierte "ESPAÑOL", "español" o "Español" siempre en "Español"
// (primera letra mayúscula, el resto minúscula). No se exporta: es un
// detalle interno de cómo armamos el pedido a la API.
function capitalizarPrimeraLetra(texto) {
    const primeraLetra = texto.charAt(0).toUpperCase()
    const restoLetras = texto.slice(1).toLowerCase()
    return primeraLetra + restoLetras
}

// --- detalle completo de una receta, por id ---
export async function obtenerRecetaCompleta(id) {
    const respuesta = await fetch(`${BASE_URL}/lookup.php?i=${id}`)
    if (!respuesta.ok) {
        throw new Error("No pudimos cargar la receta")
    }

    const datos = await respuesta.json()
    const meal = datos.meals[0]

    return {
        id: meal.idMeal,
        nombre: meal.strMeal,
        imagen: meal.strMealThumb,
        categoria: meal.strCategory,
        pais: meal.strArea,
        instrucciones: meal.strInstructions,
        video: meal.strYoutube,
        ingredientes: armarListaIngredientes(meal)
    }
}

// La API trae los ingredientes en veinte campos separados (strIngredient1,
// strIngredient2...) en vez de un array, muchos de ellos vacíos. Los
// recorremos y los combinamos en una sola lista simple, descartando los
// que vienen vacíos. Esta función no se exporta: solo la usa este archivo.
function armarListaIngredientes(meal) {
    const ingredientes = []

    for (let i = 1; i <= 20; i++) {
        const ingrediente = meal["strIngredient" + i]
        const medida = meal["strMeasure" + i]

        if (ingrediente !== null && ingrediente !== "" && ingrediente !== undefined) {
            ingredientes.push(medida + " " + ingrediente)
        }
    }

    return ingredientes
}
