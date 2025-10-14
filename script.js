let productoSeleccionado = null;

function seleccionarProducto(el) {
  document.querySelectorAll('.opcion').forEach(op => op.classList.remove('seleccionada'));
  el.classList.add('seleccionada');
  productoSeleccionado = el.getAttribute('data-tipo');

  const label = document.querySelector('label[for="kg"]');
  const input = document.getElementById('kg');

  // Cambia texto y placeholder según tipo
  if (productoSeleccionado === "prepizza" || productoSeleccionado === "pan") {
    label.textContent = "¿Cuántas unidades querés hacer?";
    input.placeholder = "Ej: 10";
  } else {
    label.textContent = "¿Cuántos kilos querés hacer?";
    input.placeholder = "Ej: 5";
  }
}

function calcular() {
  const valor = parseFloat(document.getElementById('kg').value);
  const resultado = document.getElementById('resultado');
  const lista = document.getElementById('lista-ingredientes');
  const nombre = document.getElementById('nombre-producto');
  const imagen = document.getElementById('imagen-producto');
  const total = document.getElementById('total');

  if (!productoSeleccionado) {
    alert('Primero elegí el tipo de producto.');
    return;
  }

  if (!valor || valor <= 0) {
    alert('Ingresá una cantidad válida.');
    return;
  }

  const recetas = {
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
      ingredientes: { Harina: 500, Sal: 20, Grasa: 100, Agua: 250, Levadura: 3, Queso: 200 },
      tipo: "kg"
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
      ingredientes: { Harina: 1000, Huevos: 2, Manteca: 370, Azúcar: 200, Agua: 300, Sal: 10 },
      tipo: "kg",
      infoExtra: "🥐 Rinde aproximadamente 1,8 kg de masa (unas 66 facturas de 27 g cada una)."
    }
  };

  const receta = recetas[productoSeleccionado];
  imagen.src = receta.imagen;
  nombre.textContent = receta.nombre;

  let html = "";

  if (receta.tipo === "kg") {
    for (const [ingrediente, cantidadBase] of Object.entries(receta.ingredientes)) {
      const cantidad = cantidadBase * valor;
      const unidad = ingrediente === "Agua" ? "ml" : (ingrediente === "Huevos" ? "u" : "g");
      html += `<li><strong>${ingrediente}:</strong> ${cantidad.toFixed(1)} ${unidad}</li>`;
    }
    if (receta.infoExtra) {
      total.innerHTML = receta.infoExtra;
    } else {
      total.textContent = `🔸 Esto te rinde aproximadamente ${valor.toFixed(1)} kg de ${receta.nombre.toLowerCase()}.`;
    }
  } else if (receta.tipo === "unidad") {
    const proporcion = valor / receta.baseRinde;
    for (const [ingrediente, cantidadBase] of Object.entries(receta.ingredientes)) {
      const cantidad = cantidadBase * proporcion;
      const unidad = (ingrediente === "Agua" || ingrediente === "Aceite") ? "cc" : "g";
      html += `<li><strong>${ingrediente}:</strong> ${cantidad.toFixed(1)} ${unidad}</li>`;
    }
    total.textContent = `🍞 Con esta cantidad hacés ${valor} ${receta.nombre.toLowerCase()}s.`;
  }

  lista.innerHTML = html;
  resultado.classList.remove('oculto');
}