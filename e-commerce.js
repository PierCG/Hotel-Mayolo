(function() {
  "use strict";

const WHATSAPP_HOTEL = "51944216425";
const CLAVE_CARRITO = "hotel-mayolo-carrito";

const productos = [
  {
    id: "coca-cola-1l",
    nombre: "Coca-Cola 1 L",
    descripcion: "Gaseosa familiar de 1 litro para compartir en la habitación.",
    precio: 8,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/coca-cola-1l.png",
    alt: "Botella de Coca-Cola de un litro"
  },
  {
    id: "inca-kola-sin-azucar-1l",
    nombre: "Inca Kola sin azúcar 1 L",
    descripcion: "Botella de 1 litro, opción sin azúcar para acompañar tu estadía.",
    precio: 8,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/inca-kola-sin-azucar-1l.png",
    alt: "Botella de Inca Kola sin azúcar de un litro"
  },
  {
    id: "agua-cielo",
    nombre: "Agua Cielo",
    descripcion: "Agua sin gas en botella personal para tener a mano durante el día.",
    precio: 4,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/agua-cielo.png",
    alt: "Botella de agua Cielo"
  },
  {
    id: "agua-san-luis",
    nombre: "Agua San Luis",
    descripcion: "Agua sin gas en botella personal, práctica para la habitación.",
    precio: 4,
    categoria: "bebidas",
    categoriaTexto: "Bebidas",
    imagen: "assets/imagenes/productos/agua-san-luis.png",
    alt: "Botella de agua San Luis"
  },
  {
    id: "galleta-casino-menta",
    nombre: "Galleta Casino menta",
    descripcion: "Galleta rellena sabor menta, presentación individual.",
    precio: 2.5,
    categoria: "galletas",
    categoriaTexto: "Galletas",
    imagen: "assets/imagenes/productos/galleta-casino-menta.png",
    alt: "Paquete de galleta Casino sabor menta"
  },
  {
    id: "galleta-tentacion-chocolate",
    nombre: "Galleta Tentación chocolate",
    descripcion: "Galleta rellena sabor chocolate, presentación individual.",
    precio: 2.5,
    categoria: "galletas",
    categoriaTexto: "Galletas",
    imagen: "assets/imagenes/productos/galleta-tentacion-chocolate.png",
    alt: "Paquete de galleta Tentación sabor chocolate"
  },
  {
    id: "galleta-picaras-chocolate",
    nombre: "Galleta Pícaras",
    descripcion: "Galleta bañada con cobertura sabor chocolate.",
    precio: 2.5,
    categoria: "galletas",
    categoriaTexto: "Galletas",
    imagen: "assets/imagenes/productos/galleta-picaras-chocolate.png",
    alt: "Paquete de galletas Pícaras con cobertura de chocolate"
  },
  {
    id: "head-shoulders-sachet",
    nombre: "Head & Shoulders sachet",
    descripcion: "Shampoo control caspa en sachet personal de 18 ml.",
    precio: 2,
    categoria: "aseo",
    categoriaTexto: "Aseo",
    imagen: "assets/imagenes/productos/shampoo-head-shoulders-sachet.png",
    alt: "Sachet de shampoo Head & Shoulders"
  },
  {
    id: "sedal-duo-sachet",
    nombre: "Sedal duo sachet",
    descripcion: "Shampoo y acondicionador 2 en 1 en sachet personal de 40 ml.",
    precio: 2,
    categoria: "aseo",
    categoriaTexto: "Aseo",
    imagen: "assets/imagenes/productos/sedal-duo-sachet.png",
    alt: "Sachet Sedal duo shampoo y acondicionador"
  },
  {
    id: "pantene-restauracion-sachet",
    nombre: "Pantene restauración sachet",
    descripcion: "Shampoo y acondicionador Pantene restauración en sachet.",
    precio: 2,
    categoria: "aseo",
    categoriaTexto: "Aseo",
    imagen: "assets/imagenes/productos/pantene-restauracion-sachet.png",
    alt: "Sachet Pantene shampoo y acondicionador restauración"
  }
];

let carrito = cargarCarrito();
let categoriaActiva = "todos";
let focoAntesDelCarrito = null;
let temporizadorAnuncio = null;

const listaProductos = document.getElementById("lista-productos");
const buscarProducto = document.getElementById("buscar-producto");
const resultadoBusqueda = document.getElementById("resultado-busqueda");
const filtros = document.querySelectorAll(".filtro");
const botonMenu = document.getElementById("boton-menu-tienda");
const menuTienda = document.getElementById("menu-tienda");
const botonAbrirCarrito = document.getElementById("abrir-carrito");
const botonCerrarCarrito = document.getElementById("cerrar-carrito");
const panelCarrito = document.getElementById("carrito");
const fondoCarrito = document.getElementById("fondo-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const carritoVacio = document.getElementById("carrito-vacio");
const contadorCarrito = document.getElementById("contador-carrito");
const subtotalCarrito = document.getElementById("subtotal-carrito");
const totalCarrito = document.getElementById("total-carrito");
const botonCheckout = document.getElementById("ir-checkout");
const modalPedido = document.getElementById("modal-pedido");
const botonCerrarPedido = document.getElementById("cerrar-pedido");
const formularioPedido = document.getElementById("formulario-pedido");
const resumenCheckout = document.getElementById("resumen-checkout");
const campoHabitacionContenedor = document.getElementById("campo-habitacion");
const campoHabitacion = document.getElementById("habitacion-pedido");
const modalConfirmacion = document.getElementById("modal-confirmacion");
const botonCerrarConfirmacion = document.getElementById("cerrar-confirmacion");
const textoConfirmacion = document.getElementById("texto-confirmacion");
const enlaceWhatsApp = document.getElementById("enviar-whatsapp");
const anuncioEstado = document.getElementById("anuncio-estado");

function cargarCarrito() {
  try {
    let datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
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
    let producto = obtenerProducto(item.id);
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
  let elemento = document.createElement(etiqueta);
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
  let tarjeta = crearElemento("article", { className: "tarjeta-producto card h-100" });
  let visual = crearElemento("div", { className: "producto-visual" });
  let imagen = crearElemento("img", {
    className: "producto-imagen card-img-top img-fluid",
    attributes: {
      src: producto.imagen,
      alt: producto.alt,
      width: "900",
      height: "675",
      loading: "lazy"
    }
  });
  let etiqueta = crearElemento("span", {
    className: "producto-etiqueta badge rounded-pill",
    textContent: producto.categoriaTexto
  });
  let contenido = crearElemento("div", { className: "producto-contenido card-body" });
  let titulo = crearElemento("h3", { textContent: producto.nombre });
  let descripcion = crearElemento("p", { textContent: producto.descripcion });
  let pie = crearElemento("div", { className: "producto-pie d-flex align-items-center justify-content-between gap-3" });
  let precio = crearElemento("strong", {
    className: "producto-precio",
    textContent: formatearPrecio(producto.precio)
  });
  let boton = crearElemento("button", {
    className: "agregar-producto btn btn-sm",
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
  let elemento = crearElemento("li", { className: "item-carrito" });
  let imagen = crearElemento("img", {
    className: "item-carrito__imagen",
    attributes: {
      src: producto.imagen,
      alt: "",
      width: "72",
      height: "72"
    }
  });
  let detalle = crearElemento("div", { className: "item-carrito__detalle" });
  let titulo = crearElemento("h3", { textContent: producto.nombre });
  let precioUnidad = crearElemento("p", {
    textContent: formatearPrecio(producto.precio) + " por unidad"
  });
  let subtotal = crearElemento("strong", {
    textContent: formatearPrecio(producto.precio * item.cantidad)
  });
  let controles = crearElemento("div", { className: "controles-cantidad d-flex align-items-center justify-content-between gap-3" });
  let selector = crearElemento("div", {
    className: "selector-cantidad",
    attributes: {
      "aria-label": "Cantidad de " + producto.nombre
    }
  });
  let restar = crearElemento("button", {
    textContent: "\u2212",
    attributes: {
      type: "button",
      "data-accion": "restar",
      "data-producto": producto.id,
      "aria-label": "Quitar una unidad de " + producto.nombre
    }
  });
  let cantidad = crearElemento("span", {
    textContent: item.cantidad,
    attributes: {
      "aria-label": item.cantidad + " unidades"
    }
  });
  let sumar = crearElemento("button", {
    textContent: "+",
    attributes: {
      type: "button",
      "data-accion": "sumar",
      "data-producto": producto.id,
      "aria-label": "Agregar una unidad de " + producto.nombre
    }
  });
  let eliminar = crearElemento("button", {
    className: "eliminar-producto btn btn-sm",
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
  let consulta = normalizarTexto(buscarProducto.value.trim());
  let productosFiltrados = productos.filter(function(producto) {
    let coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva;
    let textoProducto = normalizarTexto(producto.nombre + " " + producto.descripcion + " " + producto.categoriaTexto);
    return coincideCategoria && textoProducto.includes(consulta);
  });

  listaProductos.replaceChildren();

  if (!productosFiltrados.length) {
    let sinResultados = document.createElement("p");
    sinResultados.className = "sin-resultados";
    sinResultados.textContent = "No encontramos productos con esos criterios. Prueba con otra búsqueda o categoría.";
    listaProductos.appendChild(sinResultados);
  } else {
    productosFiltrados.forEach(function(producto) {
      listaProductos.appendChild(crearTarjetaProducto(producto));
    });
  }

  let cantidad = productosFiltrados.length;
  resultadoBusqueda.textContent = cantidad === 1 ? "1 producto disponible." : cantidad + " productos disponibles.";
}

function renderizarCarrito() {
  listaCarrito.replaceChildren();
  let cantidadTotal = obtenerCantidadTotal();
  let total = obtenerTotal();

  carritoVacio.hidden = carrito.length > 0;

  carrito.forEach(function(item) {
    let producto = obtenerProducto(item.id);
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
  let producto = obtenerProducto(id);
  if (!producto) {
    return;
  }

  let item = carrito.find(function(elemento) {
    return elemento.id === id;
  });

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id: id, cantidad: 1 });
  }

  renderizarCarrito();
  let cantidadTotal = obtenerCantidadTotal();
  anunciar(producto.nombre + " agregado al carrito. Ahora tienes " + cantidadTotal + (cantidadTotal === 1 ? " producto." : " productos."));
}

function cambiarCantidad(id, cambio) {
  let item = carrito.find(function(elemento) {
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
  let producto = obtenerProducto(id);
  carrito = carrito.filter(function(item) {
    return item.id !== id;
  });
  renderizarCarrito();
  if (producto) {
    anunciar(producto.nombre + " eliminado del carrito.");
  }
}

function alternarMenu() {
  let abierto = menuTienda.classList.toggle("abierto");
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
  let total = obtenerTotal();
  let cantidad = obtenerCantidadTotal();
  let resumen = crearElemento("p", { className: "d-flex justify-content-between gap-3 mb-0" });
  let cantidadResumen = crearElemento("span", {
    textContent: cantidad + (cantidad === 1 ? " producto" : " productos")
  });
  let totalResumen = crearElemento("strong", {
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
  let errores = [];
  let nombre = document.getElementById("nombre-pedido");
  let telefono = document.getElementById("telefono-pedido");
  let aceptacion = document.getElementById("aceptar-pedido");
  let entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;

  limpiarError(nombre, "error-nombre");
  limpiarError(telefono, "error-telefono");
  limpiarError(campoHabitacion, "error-habitacion");
  limpiarError(aceptacion, "error-aceptacion");

  if (nombre.value.trim().length < 3) {
    let errorNombre = "Escribe tu nombre completo (mínimo 3 caracteres).";
    mostrarError(nombre, "error-nombre", errorNombre);
    errores.push({ campo: nombre, mensaje: errorNombre });
  }

  if (telefono.value.replace(/\D/g, "").length < 7) {
    let errorTelefono = "Ingresa un teléfono válido de al menos 7 dígitos.";
    mostrarError(telefono, "error-telefono", errorTelefono);
    errores.push({ campo: telefono, mensaje: errorTelefono });
  }

  if (entrega === "Habitación" && !campoHabitacion.value.trim()) {
    let errorHabitacion = "Indica el número de habitación para poder entregarte el pedido.";
    mostrarError(campoHabitacion, "error-habitacion", errorHabitacion);
    errores.push({ campo: campoHabitacion, mensaje: errorHabitacion });
  }

  if (!aceptacion.checked) {
    let errorAceptacion = "Marca la confirmación para continuar.";
    mostrarError(aceptacion, "error-aceptacion", errorAceptacion);
    errores.push({ campo: aceptacion, mensaje: errorAceptacion });
  }

  let resumenErrores = document.getElementById("errores-formulario");
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
  let lineas = carritoConfirmado.map(function(item) {
    let producto = obtenerProducto(item.id);
    return "• " + producto.nombre + " x" + item.cantidad + " — " + formatearPrecio(producto.precio * item.cantidad);
  });
  let total = carritoConfirmado.reduce(function(suma, item) {
    let producto = obtenerProducto(item.id);
    return suma + producto.precio * item.cantidad;
  }, 0);

  let texto = "Hola Hotel Mayolo. Quiero confirmar el pedido " + numeroPedido + ".\n\n";
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

  let carritoConfirmado = carrito.map(function(item) {
    return { id: item.id, cantidad: item.cantidad };
  });
  let entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;
  let datos = {
    nombre: document.getElementById("nombre-pedido").value.trim(),
    telefono: document.getElementById("telefono-pedido").value.trim(),
    entrega: entrega,
    habitacion: campoHabitacion.value.trim(),
    nota: document.getElementById("nota-pedido").value.trim()
  };
  let numeroPedido = "MAY-" + String(Date.now()).slice(-6);
  let detalle = armarDetallePedido(datos, carritoConfirmado, numeroPedido);
  let cantidadConfirmada = obtenerCantidadTotal();

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
  let entrega = formularioPedido.querySelector('input[name="entrega"]:checked').value;
  let necesitaHabitacion = entrega === "Habitación";
  campoHabitacionContenedor.hidden = !necesitaHabitacion;
  campoHabitacion.required = necesitaHabitacion;
  if (!necesitaHabitacion) {
    campoHabitacion.value = "";
    limpiarError(campoHabitacion, "error-habitacion");
  }
}

listaProductos.addEventListener("click", function(evento) {
  let boton = evento.target.closest("[data-producto]");
  if (boton && boton.classList.contains("agregar-producto")) {
    agregarAlCarrito(boton.dataset.producto);
  }
});

listaCarrito.addEventListener("click", function(evento) {
  let boton = evento.target.closest("button[data-accion]");
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
      let activo = elemento === filtro;
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
