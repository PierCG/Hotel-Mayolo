(function() {
  "use strict";

  const tienda = window.MayoloTienda;
  if (!tienda) {
    return;
  }

  const productos = tienda.productos;
  let carrito = tienda.cargarCarrito();
  let categoriaActiva = "todos";
  let focoAntesDelCarrito = null;
  let temporizadorAnuncio = null;

  const listaProductos = document.getElementById("lista-productos");
  const buscarProducto = document.getElementById("buscar-producto");
  const resultadoBusqueda = document.getElementById("resultado-busqueda");
  const filtros = Array.from(document.querySelectorAll(".filtro"));
  const menuResponsive = tienda.configurarMenuResponsive(
    document.getElementById("boton-menu-tienda"),
    document.getElementById("menu-tienda")
  );
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
  const botonVaciarCarrito = document.getElementById("vaciar-carrito");
  const anuncioEstado = document.getElementById("anuncio-estado");

  function anunciar(mensaje) {
    if (!anuncioEstado) {
      return;
    }

    window.clearTimeout(temporizadorAnuncio);
    anuncioEstado.textContent = mensaje;
    anuncioEstado.classList.add("visible");
    temporizadorAnuncio = window.setTimeout(function() {
      anuncioEstado.classList.remove("visible");
    }, 2600);
  }

  function crearTarjetaProducto(producto) {
    let tarjeta = tienda.crearElemento("article", { className: "tarjeta-producto card h-100" });
    let visual = tienda.crearElemento("div", { className: "producto-visual" });
    let imagen = tienda.crearElemento("img", {
      className: "producto-imagen card-img-top img-fluid",
      attributes: {
        src: producto.imagen,
        alt: producto.alt,
        width: "900",
        height: "675",
        loading: "lazy"
      }
    });
    let etiqueta = tienda.crearElemento("span", {
      className: "producto-etiqueta badge rounded-pill",
      textContent: producto.categoriaTexto
    });
    let contenido = tienda.crearElemento("div", { className: "producto-contenido card-body" });
    let titulo = tienda.crearElemento("h3", { textContent: producto.nombre });
    let descripcion = tienda.crearElemento("p", { textContent: producto.descripcion });
    let pie = tienda.crearElemento("div", { className: "producto-pie d-flex align-items-center justify-content-between gap-3" });
    let precio = tienda.crearElemento("strong", {
      className: "producto-precio",
      textContent: tienda.formatearPrecio(producto.precio)
    });
    let boton = tienda.crearElemento("button", {
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
    let elemento = tienda.crearElemento("li", { className: "item-carrito" });
    let imagen = tienda.crearElemento("img", {
      className: "item-carrito__imagen",
      attributes: {
        src: producto.imagen,
        alt: "",
        width: "72",
        height: "72"
      }
    });
    let detalle = tienda.crearElemento("div", { className: "item-carrito__detalle" });
    let titulo = tienda.crearElemento("h3", { textContent: producto.nombre });
    let precioUnidad = tienda.crearElemento("p", {
      textContent: tienda.formatearPrecio(producto.precio) + " por unidad"
    });
    let subtotal = tienda.crearElemento("strong", {
      textContent: tienda.formatearPrecio(producto.precio * item.cantidad)
    });
    let controles = tienda.crearElemento("div", { className: "controles-cantidad d-flex align-items-center justify-content-between gap-3" });
    let selector = tienda.crearElemento("div", {
      className: "selector-cantidad",
      attributes: {
        "aria-label": "Cantidad de " + producto.nombre
      }
    });
    let restar = tienda.crearElemento("button", {
      textContent: "−",
      attributes: {
        type: "button",
        "data-accion": "restar",
        "data-producto": producto.id,
        "aria-label": "Quitar una unidad de " + producto.nombre
      }
    });
    let cantidad = tienda.crearElemento("span", {
      textContent: item.cantidad,
      attributes: {
        "aria-label": item.cantidad + " unidades"
      }
    });
    let sumar = tienda.crearElemento("button", {
      textContent: "+",
      attributes: {
        type: "button",
        "data-accion": "sumar",
        "data-producto": producto.id,
        "aria-label": "Agregar una unidad de " + producto.nombre
      }
    });
    let eliminar = tienda.crearElemento("button", {
      className: "eliminar-producto btn btn-sm",
      textContent: "Eliminar",
      attributes: {
        type: "button",
        "data-accion": "eliminar",
        "data-producto": producto.id,
        "aria-label": "Eliminar " + producto.nombre + " del carrito"
      }
    });
    detalle.append(titulo, precioUnidad);
    selector.append(restar, cantidad, sumar);
    controles.append(selector, eliminar);
    elemento.append(imagen, detalle, subtotal, controles);

    return elemento;
  }

  function obtenerProductosFiltrados() {
    let consulta = tienda.normalizarTexto(buscarProducto.value.trim());

    return productos.filter(function(producto) {
      let coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva;
      let textoProducto = tienda.normalizarTexto(producto.nombre + " " + producto.descripcion + " " + producto.categoriaTexto);
      return coincideCategoria && textoProducto.includes(consulta);
    });
  }

  function renderizarProductos() {
    let productosFiltrados = obtenerProductosFiltrados();

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

    resultadoBusqueda.textContent = productosFiltrados.length === 1 ? "1 producto disponible." : productosFiltrados.length + " productos disponibles.";
  }

  function guardarYRenderizarCarrito() {
    let cantidadTotal = tienda.obtenerCantidadTotal(carrito);
    let total = tienda.obtenerTotal(carrito);

    listaCarrito.replaceChildren();
    carritoVacio.hidden = carrito.length > 0;

    carrito.forEach(function(item) {
      let producto = tienda.obtenerProducto(item.id);
      if (producto) {
        listaCarrito.appendChild(crearItemCarrito(item, producto));
      }
    });

    contadorCarrito.textContent = cantidadTotal;
    botonAbrirCarrito.setAttribute("aria-label", "Abrir carrito de compras, " + cantidadTotal + (cantidadTotal === 1 ? " producto" : " productos"));
    subtotalCarrito.textContent = tienda.formatearPrecio(total);
    totalCarrito.textContent = tienda.formatearPrecio(total);
    botonCheckout.disabled = carrito.length === 0;
    botonVaciarCarrito.disabled = carrito.length === 0;
    tienda.guardarCarrito(carrito);
  }

  function agregarAlCarrito(id) {
    let producto = tienda.obtenerProducto(id);
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

    guardarYRenderizarCarrito();
    anunciar(producto.nombre + " agregado al carrito. Ahora tienes " + tienda.obtenerCantidadTotal(carrito) + (tienda.obtenerCantidadTotal(carrito) === 1 ? " producto." : " productos."));
  }

  function cambiarCantidad(id, cambio) {
    let item = carrito.find(function(elemento) {
      return elemento.id === id;
    });

    if (!item) {
      return;
    }

    item.cantidad = Math.max(0, item.cantidad + cambio);
    if (item.cantidad === 0) {
      carrito = carrito.filter(function(elemento) {
        return elemento.id !== id;
      });
    }

    guardarYRenderizarCarrito();
  }

  function eliminarProducto(id) {
    let producto = tienda.obtenerProducto(id);
    carrito = carrito.filter(function(elemento) {
      return elemento.id !== id;
    });
    guardarYRenderizarCarrito();
    if (producto) {
      anunciar(producto.nombre + " eliminado del carrito.");
    }
  }

  function vaciarCarrito() {
    if (!carrito.length) {
      return;
    }

    carrito = [];
    guardarYRenderizarCarrito();
    anunciar("Carrito vaciado.");
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
    menuResponsive.cerrar();
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
    if (!carrito.length) {
      anunciar("Agrega productos antes de continuar al pago.");
      return;
    }

    window.location.href = "pago.html";
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
      eliminarProducto(boton.dataset.producto);
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

  botonAbrirCarrito.addEventListener("click", abrirCarrito);
  botonCerrarCarrito.addEventListener("click", function() { cerrarCarrito(true); });
  fondoCarrito.addEventListener("click", function() { cerrarCarrito(true); });
  botonCheckout.addEventListener("click", prepararCheckout);
  botonVaciarCarrito.addEventListener("click", vaciarCarrito);

  document.addEventListener("keydown", function(evento) {
    if (evento.key === "Escape" && panelCarrito.classList.contains("abierto")) {
      cerrarCarrito(true);
    }
  });

  renderizarProductos();
  guardarYRenderizarCarrito();

  if (window.location.hash === "#carrito") {
    window.setTimeout(abrirCarrito, 0);
  }
})();
