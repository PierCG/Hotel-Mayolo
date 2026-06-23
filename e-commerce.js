(function() {
  "use strict";

var WHATSAPP_HOTEL = "51944216425";
var CLAVE_CARRITO = "hotel-mayolo-carrito";

var productos = [
  {
    id: "agua-mineral",
    nombre: "Agua mineral",
    descripcion: "Botella de 625 ml, fría o al tiempo. Ideal para tener junto a la cama.",
    precio: 4,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/agua-mineral-producto.webp",
    alt: "Botella transparente de agua mineral fría en una habitación de hotel"
  },
  {
    id: "cafe-altura",
    nombre: "Café de altura",
    descripcion: "Café filtrante de la sierra central con azúcar, endulzante y vaso térmico.",
    precio: 9,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/cafe-altura.jpg",
    alt: "Tazas de café recién preparado vistas desde arriba"
  },
  {
    id: "kit-aseo",
    nombre: "Kit de aseo",
    descripcion: "Cepillo dental, pasta, peine y jabón en una bolsa reutilizable.",
    precio: 12,
    categoria: "bienestar",
    categoriaTexto: "Bienestar",
    imagen: "assets/imagenes/productos/kit-aseo-producto.webp",
    alt: "Kit de aseo con cepillo, pasta dental, jabón y peine"
  },
  {
    id: "pantuflas",
    nombre: "Pantuflas de descanso",
    descripcion: "Par ligero y cómodo para usar dentro de la habitación. Talla estándar.",
    precio: 15,
    categoria: "bienestar",
    categoriaTexto: "Bienestar",
    imagen: "assets/imagenes/productos/pantuflas-producto.webp",
    alt: "Par de pantuflas de hotel color crema sobre lino"
  },
  {
    id: "snack-andino",
    nombre: "Snack andino",
    descripcion: "Mix individual de cancha serrana, habas crocantes y frutos secos.",
    precio: 10,
    categoria: "local",
    categoriaTexto: "Detalle local",
    imagen: "assets/imagenes/productos/snack-andino-producto.webp",
    alt: "Bowl de snack andino con maíz tostado, habas y frutos secos"
  },
  {
    id: "taza-mayolo",
    nombre: "Taza Mayolo",
    descripcion: "Recuerdo de cerámica con identidad huancaína, empacado para viaje.",
    precio: 24,
    categoria: "local",
    categoriaTexto: "Detalle local",
    imagen: "assets/imagenes/productos/taza-mayolo.jpg",
    alt: "Taza de cerámica blanca sobre una mesa clara"
  }
];

var carrito = cargarCarrito();
var categoriaActiva = "todos";
var focoAntesDelCarrito = null;
var temporizadorAnuncio = null;

var listaProductos = document.getElementById("lista-productos");
var buscarProducto = document.getElementById("buscar-producto");
var resultadoBusqueda = document.getElementById("resultado-busqueda");
var filtros = document.querySelectorAll(".filtro");
var botonMenu = document.getElementById("boton-menu-tienda");
var menuTienda = document.getElementById("menu-tienda");
var botonAbrirCarrito = document.getElementById("abrir-carrito");
var botonCerrarCarrito = document.getElementById("cerrar-carrito");
var panelCarrito = document.getElementById("carrito");
var fondoCarrito = document.getElementById("fondo-carrito");
var listaCarrito = document.getElementById("lista-carrito");
var carritoVacio = document.getElementById("carrito-vacio");
var contadorCarrito = document.getElementById("contador-carrito");
var subtotalCarrito = document.getElementById("subtotal-carrito");
var totalCarrito = document.getElementById("total-carrito");
var botonCheckout = document.getElementById("ir-checkout");
var modalPedido = document.getElementById("modal-pedido");
var botonCerrarPedido = document.getElementById("cerrar-pedido");
var formularioPedido = document.getElementById("formulario-pedido");
var resumenCheckout = document.getElementById("resumen-checkout");
var campoHabitacionContenedor = document.getElementById("campo-habitacion");
var campoHabitacion = document.getElementById("habitacion-pedido");
var modalConfirmacion = document.getElementById("modal-confirmacion");
var botonCerrarConfirmacion = document.getElementById("cerrar-confirmacion");
var textoConfirmacion = document.getElementById("texto-confirmacion");
var enlaceWhatsApp = document.getElementById("enviar-whatsapp");
var anuncioEstado = document.getElementById("anuncio-estado");

function cargarCarrito() {
  try {
    var datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.filter(function(item) {
      return productos.some(function(producto) {
        return producto.id === item.id;
      }) && Number.isInteger(item.cantidad) && item.cantidad > 0;
    });
  } catch (error) {
    return [];
  }
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

function normalizarTexto(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatearPrecio(precio) {
  return "S/ " + precio.toFixed(2);
}

function obtenerProducto(id) {
  return productos.find(function(producto) {
    return producto.id === id;
  });
}

function obtenerCantidadTotal() {
  return carrito.reduce(function(total, item) {
    return total + item.cantidad;
  }, 0);
}

function obtenerTotal() {
  return carrito.reduce(function(total, item) {
    var producto = obtenerProducto(item.id);
    return producto ? total + producto.precio * item.cantidad : total;
  }, 0);
}

function anunciar(mensaje) {
  window.clearTimeout(temporizadorAnuncio);
  anuncioEstado.textContent = mensaje;
  anuncioEstado.classList.add("visible");
  temporizadorAnuncio = window.setTimeout(function() {
    anuncioEstado.classList.remove("visible");
  }, 2600);
}

function crearElemento(etiqueta, opciones) {
  var elemento = document.createElement(etiqueta);
  opciones = opciones || {};

  if (opciones.className) {
    elemento.className = opciones.className;
  }

  if ("textContent" in opciones) {
    elemento.textContent = opciones.textContent;
  }

  if (opciones.attributes) {
    Object.keys(opciones.attributes).forEach(function(nombre) {
      elemento.setAttribute(nombre, opciones.attributes[nombre]);
    });
  }

  return elemento;
}

function crearTarjetaProducto(producto) {
  var tarjeta = crearElemento("article", { className: "tarjeta-producto" });
  var visual = crearElemento("div", { className: "producto-visual" });
  var imagen = crearElemento("img", {
    className: "producto-imagen",
    attributes: {
      src: producto.imagen,
      alt: producto.alt,
      width: "900",
      height: "675",
      loading: "lazy"
    }
  });
  var etiqueta = crearElemento("span", {
    className: "producto-etiqueta",
    textContent: producto.categoriaTexto
  });
  var contenido = crearElemento("div", { className: "producto-contenido" });
  var titulo = crearElemento("h3", { textContent: producto.nombre });
  var descripcion = crearElemento("p", { textContent: producto.descripcion });
  var pie = crearElemento("div", { className: "producto-pie" });
  var precio = crearElemento("strong", {
    className: "producto-precio",
    textContent: formatearPrecio(producto.precio)
  });
  var boton = crearElemento("button", {
    className: "agregar-producto",
    textContent: "Agregar",
    attributes: {
      type: "button",
      "data-producto": producto.id,
      "aria-label": "Agregar " + producto.nombre + " al carrito"
    }
  });

  visual.append(imagen, etiqueta);
  pie.append(precio, boton);
  contenido.append(titulo, descripcion, pie);
  tarjeta.append(visual, contenido);

  return tarjeta;
}

function crearItemCarrito(item, producto) {
  var elemento = crearElemento("li", { className: "item-carrito" });
  var imagen = crearElemento("img", {
    className: "item-carrito__imagen",
    attributes: {
      src: producto.imagen,
      alt: "",
      width: "72",
      height: "72"
    }
  });
  var detalle = crearElemento("div", { className: "item-carrito__detalle" });
  var titulo = crearElemento("h3", { textContent: producto.nombre });
  var precioUnidad = crearElemento("p", {
    textContent: formatearPrecio(producto.precio) + " por unidad"
  });
  var subtotal = crearElemento("strong", {
    textContent: formatearPrecio(producto.precio * item.cantidad)
  });
  var controles = crearElemento("div", { className: "controles-cantidad" });
  var selector = crearElemento("div", {
    className: "selector-cantidad",
    attributes: {
      "aria-label": "Cantidad de " + producto.nombre
    }
  });
  var restar = crearElemento("button", {
    textContent: "\u2212",
    attributes: {
      type: "button",
      "data-accion": "restar",
      "data-producto": producto.id,
      "aria-label": "Quitar una unidad de " + producto.nombre
    }
  });
  var cantidad = crearElemento("span", {
    textContent: item.cantidad,
    attributes: {
      "aria-label": item.cantidad + " unidades"
    }
  });
  var sumar = crearElemento("button", {
    textContent: "+",
    attributes: {
      type: "button",
      "data-accion": "sumar",
      "data-producto": producto.id,
      "aria-label": "Agregar una unidad de " + producto.nombre
    }
  });
  var eliminar = crearElemento("button", {
    className: "eliminar-producto",
    textContent: "Eliminar " + producto.nombre,
    attributes: {
      type: "button",
      "data-accion": "eliminar",
      "data-producto": producto.id
    }
  });

  detalle.append(titulo, precioUnidad);
  selector.append(restar, cantidad, sumar);
  controles.append(selector, eliminar);
  elemento.append(imagen, detalle, subtotal, controles);

  return elemento;
}

function renderizarProductos() {
  var consulta = normalizarTexto(buscarProducto.value.trim());
  var productosFiltrados = productos.filter(function(producto) {
    var coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva;
    var textoProducto = normalizarTexto(producto.nombre + " " + producto.descripcion + " " + producto.categoriaTexto);
    return coincideCategoria && textoProducto.includes(consulta);
  });

  listaProductos.replaceChildren();

  if (!productosFiltrados.length) {
    var sinResultados = document.createElement("p");
    sinResultados.className = "sin-resultados";
    sinResultados.textContent = "No encontramos productos con esos criterios. Prueba con otra búsqueda o categoría.";
    listaProductos.appendChild(sinResultados);
  } else {
    productosFiltrados.forEach(function(producto) {
      listaProductos.appendChild(crearTarjetaProducto(producto));
    });
  }

  var cantidad = productosFiltrados.length;
  resultadoBusqueda.textContent = cantidad === 1 ? "1 producto disponible." : cantidad + " productos disponibles.";
}

function renderizarCarrito() {
  listaCarrito.replaceChildren();
  var cantidadTotal = obtenerCantidadTotal();
  var total = obtenerTotal();

  carritoVacio.hidden = carrito.length > 0;

  carrito.forEach(function(item) {
    var producto = obtenerProducto(item.id);
    if (!producto) {
      return;
    }

    listaCarrito.appendChild(crearItemCarrito(item, producto));
  });

  contadorCarrito.textContent = cantidadTotal;
  botonAbrirCarrito.setAttribute("aria-label", "Abrir carrito de compras, " + cantidadTotal + (cantidadTotal === 1 ? " producto" : " productos"));
  subtotalCarrito.textContent = formatearPrecio(total);
  totalCarrito.textContent = formatearPrecio(total);
  botonCheckout.disabled = carrito.length === 0;
  guardarCarrito();
}

function agregarAlCarrito(id) {
  var producto = obtenerProducto(id);
  if (!producto) {
    return;
  }

  var item = carrito.find(function(elemento) {
    return elemento.id === id;
  });

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }

  renderizarCarrito();
  var cantidadTotal = obtenerCantidadTotal();
  anunciar(producto.nombre + " agregado al carrito. Ahora tienes " + cantidadTotal + (cantidadTotal === 1 ? " producto." : " productos."));
}

function cambiarCantidad(id, cambio) {
  var item = carrito.find(function(elemento) {
    return elemento.id === id;
  });

  if (!item) {
    return;
  }

  item.cantidad += cambio;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(function(elemento) {
      return elemento.id !== id;
    });
  }
  renderizarCarrito();
}

function eliminarDelCarrito(id) {
  var producto = obtenerProducto(id);
  carrito = carrito.filter(function(item) {
    return item.id !== id;
  });
  renderizarCarrito();
  if (producto) {
    anunciar(producto.nombre + " eliminado del carrito.");
  }
}

function alternarMenu() {
  var abierto = menuTienda.classList.toggle("abierto");
  botonMenu.classList.toggle("abierto", abierto);
  botonMenu.setAttribute("aria-expanded", String(abierto));
  botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}

function cerrarMenu() {
  menuTienda.classList.remove("abierto");
  botonMenu.classList.remove("abierto");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
}

function actualizarContenidoInerte(inerte) {
  [document.querySelector("header"), document.querySelector("main"), document.querySelector("footer")].forEach(function(elemento) {
    if (elemento) {
      elemento.inert = inerte;
    }
  });
}

function abrirCarrito() {
  focoAntesDelCarrito = document.activeElement;
  cerrarMenu();
  panelCarrito.classList.add("abierto");
  fondoCarrito.classList.add("visible");
  panelCarrito.setAttribute("aria-hidden", "false");
  botonAbrirCarrito.setAttribute("aria-expanded", "true");
  document.body.classList.add("carrito-abierto");
  actualizarContenidoInerte(true);
  document.getElementById("titulo-carrito").focus();
}

function cerrarCarrito(devolverFoco) {
  panelCarrito.classList.remove("abierto");
  fondoCarrito.classList.remove("visible");
  panelCarrito.setAttribute("aria-hidden", "true");
  botonAbrirCarrito.setAttribute("aria-expanded", "false");
  document.body.classList.remove("carrito-abierto");
  actualizarContenidoInerte(false);

  if (devolverFoco !== false && focoAntesDelCarrito && document.contains(focoAntesDelCarrito)) {
    focoAntesDelCarrito.focus();
  }
}

function prepararCheckout() {
  var total = obtenerTotal();
  var cantidad = obtenerCantidadTotal();
  var resumen = crearElemento("p");
  var cantidadResumen = crearElemento("span", {
    textContent: cantidad + (cantidad === 1 ? " producto" : " productos")
  });
  var totalResumen = crearElemento("strong", {
    textContent: formatearPrecio(total)
  });

  resumen.append(cantidadResumen, totalResumen);
  resumenCheckout.replaceChildren(resumen);
  cerrarCarrito(false);
  modalPedido.showModal();
  document.getElementById("nombre-pedido").focus();
}

function limpiarError(campo, idError) {
  campo.classList.remove("campo-invalido");
  campo.removeAttribute("aria-invalid");
  campo.removeAttribute("aria-describedby");
  document.getElementById(idError).textContent = "";
}

function mostrarError(campo, idError, mensaje) {
  campo.classList.add("campo-invalido");
  campo.setAttribute("aria-invalid", "true");
  campo.setAttribute("aria-describedby", idError);
  document.getElementById(idError).textContent = mensaje;
}

function validarFormulario() {
  var errores = [];
  var nombre = document.getElementById("nombre-pedido");
  var telefono = document.getElementById("telefono-pedido");
  var aceptacion = document.getElementById("aceptar-pedido");
  var entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;

  limpiarError(nombre, "error-nombre");
  limpiarError(telefono, "error-telefono");
  limpiarError(campoHabitacion, "error-habitacion");
  limpiarError(aceptacion, "error-aceptacion");

  if (nombre.value.trim().length < 3) {
    var errorNombre = "Escribe tu nombre completo (mínimo 3 caracteres).";
    mostrarError(nombre, "error-nombre", errorNombre);
    errores.push({ campo: nombre, mensaje: errorNombre });
  }

  if (telefono.value.replace(/\D/g, "").length < 7) {
    var errorTelefono = "Ingresa un teléfono válido de al menos 7 dígitos.";
    mostrarError(telefono, "error-telefono", errorTelefono);
    errores.push({ campo: telefono, mensaje: errorTelefono });
  }

  if (entrega === "Habitación" && !campoHabitacion.value.trim()) {
    var errorHabitacion = "Indica el número de habitación para poder entregarte el pedido.";
    mostrarError(campoHabitacion, "error-habitacion", errorHabitacion);
    errores.push({ campo: campoHabitacion, mensaje: errorHabitacion });
  }

  if (!aceptacion.checked) {
    var errorAceptacion = "Marca la confirmación para continuar.";
    mostrarError(aceptacion, "error-aceptacion", errorAceptacion);
    errores.push({ campo: aceptacion, mensaje: errorAceptacion });
  }

  var resumenErrores = document.getElementById("errores-formulario");
  if (errores.length) {
    resumenErrores.hidden = false;
    resumenErrores.textContent = "No pudimos continuar. " + errores.map(function(error) {
      return error.mensaje;
    }).join(" ");
    resumenErrores.focus();
    errores[0].campo.focus();
    return false;
  }

  resumenErrores.hidden = true;
  resumenErrores.textContent = "";
  return true;
}

function armarDetallePedido(datos, carritoConfirmado, numeroPedido) {
  var lineas = carritoConfirmado.map(function(item) {
    var producto = obtenerProducto(item.id);
    return "• " + producto.nombre + " x" + item.cantidad + " — " + formatearPrecio(producto.precio * item.cantidad);
  });
  var total = carritoConfirmado.reduce(function(suma, item) {
    var producto = obtenerProducto(item.id);
    return suma + producto.precio * item.cantidad;
  }, 0);

  var texto = "Hola Hotel Mayolo. Quiero confirmar el pedido " + numeroPedido + ".\n\n";
  texto += lineas.join("\n") + "\n";
  texto += "Total: " + formatearPrecio(total) + "\n\n";
  texto += "Nombre: " + datos.nombre + "\n";
  texto += "Teléfono: " + datos.telefono + "\n";
  texto += "Entrega: " + datos.entrega;
  if (datos.entrega === "Habitación") {
    texto += " " + datos.habitacion;
  }
  if (datos.nota) {
    texto += "\nIndicación: " + datos.nota;
  }
  return texto;
}

function confirmarPedido(evento) {
  evento.preventDefault();
  if (!validarFormulario()) {
    return;
  }

  var carritoConfirmado = carrito.map(function(item) {
    return { id: item.id, cantidad: item.cantidad };
  });
  var entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;
  var datos = {
    nombre: document.getElementById("nombre-pedido").value.trim(),
    telefono: document.getElementById("telefono-pedido").value.trim(),
    entrega: entrega,
    habitacion: campoHabitacion.value.trim(),
    nota: document.getElementById("nota-pedido").value.trim()
  };
  var numeroPedido = "MAY-" + String(Date.now()).slice(-6);
  var detalle = armarDetallePedido(datos, carritoConfirmado, numeroPedido);
  var cantidadConfirmada = obtenerCantidadTotal();

  enlaceWhatsApp.href = "https://wa.me/" + WHATSAPP_HOTEL + "?text=" + encodeURIComponent(detalle);
  textoConfirmacion.textContent = numeroPedido + " incluye " + cantidadConfirmada + (cantidadConfirmada === 1 ? " producto" : " productos") + " por " + formatearPrecio(obtenerTotal()) + ". Envíalo por WhatsApp para que recepción confirme la disponibilidad.";

  carrito = [];
  renderizarCarrito();
  formularioPedido.reset();
  actualizarCampoHabitacion();
  modalPedido.close();
  modalConfirmacion.showModal();
  document.getElementById("titulo-confirmacion").focus();
}

function actualizarCampoHabitacion() {
  var entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;
  var necesitaHabitacion = entrega === "Habitación";
  campoHabitacionContenedor.hidden = !necesitaHabitacion;
  campoHabitacion.required = necesitaHabitacion;
  if (!necesitaHabitacion) {
    campoHabitacion.value = "";
    limpiarError(campoHabitacion, "error-habitacion");
  }
}

listaProductos.addEventListener("click", function(evento) {
  var boton = evento.target.closest("[data-producto]");
  if (boton && boton.classList.contains("agregar-producto")) {
    agregarAlCarrito(boton.dataset.producto);
  }
});

listaCarrito.addEventListener("click", function(evento) {
  var boton = evento.target.closest("button[data-accion]");
  if (!boton) {
    return;
  }

  if (boton.dataset.accion === "sumar") {
    cambiarCantidad(boton.dataset.producto, 1);
  } else if (boton.dataset.accion === "restar") {
    cambiarCantidad(boton.dataset.producto, -1);
  } else if (boton.dataset.accion === "eliminar") {
    eliminarDelCarrito(boton.dataset.producto);
  }
});

buscarProducto.addEventListener("input", renderizarProductos);

filtros.forEach(function(filtro) {
  filtro.addEventListener("click", function() {
    categoriaActiva = filtro.dataset.categoria;
    filtros.forEach(function(elemento) {
      var activo = elemento === filtro;
      elemento.classList.toggle("activo", activo);
      elemento.setAttribute("aria-pressed", String(activo));
    });
    renderizarProductos();
  });
});

botonMenu.addEventListener("click", alternarMenu);
menuTienda.querySelectorAll("a").forEach(function(enlace) {
  enlace.addEventListener("click", cerrarMenu);
});
botonAbrirCarrito.addEventListener("click", abrirCarrito);
botonCerrarCarrito.addEventListener("click", function() { cerrarCarrito(true); });
fondoCarrito.addEventListener("click", function() { cerrarCarrito(true); });
botonCheckout.addEventListener("click", prepararCheckout);
botonCerrarPedido.addEventListener("click", function() { modalPedido.close(); });
botonCerrarConfirmacion.addEventListener("click", function() { modalConfirmacion.close(); });
formularioPedido.addEventListener("submit", confirmarPedido);
formularioPedido.querySelectorAll('input[name="entrega"]').forEach(function(opcion) {
  opcion.addEventListener("change", actualizarCampoHabitacion);
});

modalPedido.addEventListener("cancel", function() {
  document.getElementById("errores-formulario").hidden = true;
});

window.addEventListener("resize", function() {
  if (window.innerWidth > 920) {
    cerrarMenu();
  }
});

document.addEventListener("keydown", function(evento) {
  if (evento.key === "Escape" && panelCarrito.classList.contains("abierto")) {
    cerrarCarrito(true);
  }
});

renderizarProductos();
renderizarCarrito();
actualizarCampoHabitacion();
})();
