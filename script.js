/** script.js actualizado - con mejoras de UX y lógica de levadura más robusta **/

let productoSeleccionado = null;

// Referencias a elementos del DOM
const levInput = () => document.getElementById('levadura');
const levRange = () => document.getElementById('levaduraRange');
const levRangeVal = () => document.getElementById('lev-range-val');
const cantidadInput = () => document.getElementById('kg');
const labelCantidad = () => document.getElementById('label-cantidad');
const resultadoSection = () => document.getElementById('resultado');

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar valores por defecto del slider
  const inicial = 2.8;
  levInput().value = inicial;
  levRange().value = inicial;
  levRangeVal().textContent = Number(inicial).toFixed(1);

  // Sincronizar ambos controles de levadura
  const syncLevadura = (value) => {
    let v = parseFloat(value);
    if (isNaN(v)) v = 0;
    
    // Asegurar que el valor no exceda el max/min del slider
    const min = parseFloat(levRange().min);
    const max = parseFloat(levRange().max);
    v = Math.min(Math.max(v, min), max);

    const vFixed = v.toFixed(1);
    levInput().value = vFixed;
    levRange().value = v;
    levRangeVal().textContent = vFixed;
  };

  levRange().addEventListener('input', (e) => syncLevadura(e.target.value));
  levInput().addEventListener('input', (e) => syncLevadura(e.target.value));

  // Permitir selección por teclado en tarjetas
  document.querySelectorAll('.opcion').forEach(op => {
    op.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') seleccionarProducto(op);
    });
  });

  // Ocultar resultado al inicio
  resultadoSection().classList.add('oculto');
});

function seleccionarProducto(el) {
  document.querySelectorAll('.opcion').forEach(op => op.classList.remove('seleccionada'));
  el.classList.add('seleccionada');
  productoSeleccionado = el.getAttribute('data-tipo');

  const recetas = obtenerRecetas();
  const receta = recetas[productoSeleccionado];

  // Actualizar label y placeholder de cantidad
  if (receta.tipo === "unidad") {
    labelCantidad().textContent = "¿Cuántas unidades querés hacer?";
    // placeholder ejemplo muestra la baseRinde
    const baseExample = receta.baseRinde ? receta.baseRinde : 1;
    cantidadInput().placeholder = `Ej: ${baseExample}`;
  } else {
    labelCantidad().textContent = "¿Cuántos kilos querés hacer?";
    cantidadInput().placeholder = "Ej: 5";
  }
  
  // Ocultar el resultado al cambiar de producto
  resultadoSection().classList.add('oculto');


  // Mostrar levadura recomendada si existe; si no, mantener el valor actual.
  // La Levadura en la receta se interpreta como 'gramos por kg de harina'.
  const defaultLev = receta.ingredientes && receta.ingredientes.Levadura !== undefined 
        ? receta.ingredientes.Levadura 
        : null;

  if (defaultLev !== null) {
    // Usar syncLevadura para actualizar ambos controles
    const v = Number(defaultLev).toFixed(1);
    levInput().value = v;
    levRange().value = v;
    levRangeVal().textContent = v;
  }
}

function calcular() {
  const valor = parseFloat(cantidadInput().value);
  const valorLevadura = parseFloat(levInput().value);
  const resultado = resultadoSection();
  const lista = document.getElementById('lista-ingredientes');
  const nombre = document.getElementById('nombre-producto');
  const imagen = document.getElementById('imagen-producto');
  const total = document.getElementById('total');

  // Validaciones
  if (!productoSeleccionado) {
    alert('⚠️ Por favor, primero elegí el tipo de producto.');
    return;
  }
  if (!valor || valor <= 0 || isNaN(valor)) {
    alert('❌ Ingresá una cantidad válida mayor a cero.');
    return;
  }

  const recetas = obtenerRecetas();
  const receta = recetas[productoSeleccionado];

  // Actualizar nombre e imagen
  nombre.textContent = receta.nombre;
  if (receta.imagen) imagen.src = receta.imagen;

  let html = "";
  
  // Calcular la escala de la receta
  const esKg = receta.tipo === 'kg';
  const scale = esKg ? (valor / 1) : (valor / receta.baseRinde); // Base: 1kg (para kg) o baseRinde (para unidad)

  // Obtener la harina base para calcular la levadura total en el modo "unidad"
  const harinaBaseG = receta.ingredientes.Harina ? receta.ingredientes.Harina : 0;
  
  // Calcular la harina total en kg (solo para el cálculo de Levadura en modo 'unidad')
  const harinaTotalG = harinaBaseG * scale; 
  const harinaTotalKg = harinaTotalG / 1000;

  // Iterar ingredientes y calcular cantidades
  for (const [ingrediente, cantidadBase] of Object.entries(receta.ingredientes)) {
    let cantidad = 0;
    
    // Cálculo de Levadura: usa el valor del input * kg de harina
    if (ingrediente === "Levadura" && !isNaN(valorLevadura)) {
      if (esKg) {
        // En modo Kg: Levadura por kg de harina * (Harina de receta en kg * escala)
        // Simplificado: Levadura por kg * kilos solicitados (asumiendo que los 'kilos solicitados' son los que se desean producir)
        // **Mejorado:** Usaremos Harina Total en Kg * Levadura por kg (para ser más preciso si la receta base no es 1kg de producto final)
        const harinaRecetaKg = harinaBaseG / 1000; // Harina en la base de la receta (generalmente 0.7kg o 1kg)
        const harinaTotalCalculadaKg = harinaRecetaKg * scale; // La harina total que se va a usar para los 'kilos' de producto
        cantidad = valorLevadura * harinaTotalCalculadaKg;
      } else {
        // En modo Unidad: Levadura por kg de harina * harina total en kg
        cantidad = valorLevadura * harinaTotalKg;
      }
    } else {
      // Cálculo normal: multiplicar base por la escala (factor de multiplicación)
      cantidad = cantidadBase * scale;
    }

    // Determinar unidad y formato
    let unidad = "g";
    if (ingrediente === "Agua" || ingrediente === "Aceite") unidad = "ml";
    if (ingrediente === "Huevos") unidad = "u";
    // El resto se queda en gramos, incluyendo Margarina, Manteca, Grasa, Sal, Azúcar.
    
    // Para ingredientes no numéricos o error, mostramos 0.
    const cantidadDisplay = Number.isFinite(cantidad) ? Number(cantidad).toFixed(1) : "0.0";
    
    html += `<li><strong>${ingrediente}</strong><span class="unit">${cantidadDisplay} ${unidad}</span></li>`;
  }

  lista.innerHTML = html;

  // Mensaje final adaptado
  if (receta.infoExtra && esKg) {
    total.innerHTML = receta.infoExtra.replace("{kg}", valor.toFixed(1));
  } else if (esKg) {
    total.textContent = `✅ Esto te rinde aproximadamente ${valor.toFixed(1)} kg de ${receta.nombre.toLowerCase()}.`;
  } else {
    total.textContent = `🍞 Con esta cantidad hacés ${valor} ${receta.nombre.toLowerCase()}s. (Base de rendimiento: ${receta.baseRinde} unidades).`;
  }

  // Mostrar resultado y scroll
  resultado.classList.remove('oculto');
  setTimeout(() => {
    resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// Mantener las recetas originales
function obtenerRecetas() {
  return {
    hojaldre: {
      nombre: "Criollos de hojaldre",
      imagen: "imagenes/hojaldre.png",
      ingredientes: { Harina: 700, Sal: 21, Grasa: 140, Agua: 343, Levadura: 2.8, Margarina: 184.2 },
      tipo: "kg"
    },
    chicharron: {
      nombre: "Criollos con chicharrón",
      imagen: "imagenes/chicharrón.png",
      ingredientes: { Harina: 700, Sal: 21, Grasa: 140, Agua: 343, Levadura: 2.8, "Chicharrón": 73.6 },
      tipo: "kg"
    },
    cremonas: {
      nombre: "Cremonas",
      imagen: "imagenes/cremonas.png",
      ingredientes: { Harina: 700, Sal: 21, Grasa: 140, Agua: 343, Levadura: 2.8, Margarina: 184.2 },
      tipo: "kg",
      infoExtra: "🥐 Esto te rinde aproximadamente {kg} kg de cremonas de hojaldre."
    },
    prepizza: {
      nombre: "Pre pizza",
      imagen: "imagenes/prepizza.png",
      ingredientes: { Harina: 1000, Sal: 25, Aceite: 50, Agua: 540, Levadura: 10 },
      tipo: "unidad",
      baseRinde: 4
    },
    pan: {
      nombre: "Pan",
      imagen: "imagenes/pan.png",
      ingredientes: { Harina: 3700, Sal: 92.5, Levadura: 29.6, Agua: 1813, Grasa: 740 },
      tipo: "unidad",
      baseRinde: 10
    },
    facturas: {
      nombre: "Facturas",
      imagen: "imagenes/facturas.png",
      ingredientes: { Harina: 1000, Huevos: 2, Manteca: 370, Azúcar: 200, Agua: 300, Sal: 10, Levadura: 10 },
      tipo: "kg",
      infoExtra: "🥐 Rinde aproximadamente 1,8 kg de masa (unas 66 facturas de 27 g cada una)."
    }
  };
}
