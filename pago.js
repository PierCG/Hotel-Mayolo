(function() {
  "use strict";

  const tienda = window.MayoloTienda;
  if (!tienda) {
    return;
  }

  let carrito = tienda.cargarCarrito();

  tienda.configurarMenuResponsive(
    document.getElementById("boton-menu-tienda"),
    document.getElementById("menu-tienda")
  );
  const contadorCarrito = document.getElementById("contador-carrito");
  const resumenCheckout = document.getElementById("resumen-checkout");
  const formularioPedido = document.getElementById("formulario-pedido");
  const campoHabitacionContenedor = document.getElementById("campo-habitacion");
  const campoHabitacion = document.getElementById("habitacion-pedido");
  const confirmacionPagina = document.getElementById("confirmacion-pagina");
  const textoConfirmacion = document.getElementById("texto-confirmacion");
  const enlaceWhatsApp = document.getElementById("enviar-whatsapp");

  function renderizarResumen() {
    let cantidadTotal = tienda.obtenerCantidadTotal(carrito);
    let total = tienda.obtenerTotal(carrito);
    contadorCarrito.textContent = cantidadTotal;

    resumenCheckout.replaceChildren();

    if (!carrito.length) {
      let vacio = tienda.crearElemento("div", { className: "estado-vacio estado-vacio--checkout" });
      let texto = tienda.crearElemento("p", { textContent: "Tu carrito está vacío. Agrega productos antes de simular el pago." });
      let enlace = tienda.crearElemento("a", {
        className: "boton-tienda btn",
        textContent: "Ver productos",
        attributes: {
          href: "e-commerce.html#catalogo"
        }
      });
      vacio.append(texto, enlace);
      resumenCheckout.appendChild(vacio);
      formularioPedido.hidden = true;
      return;
    }

    let lista = tienda.crearElemento("ul", { className: "lista-resumen-pedido" });
    carrito.forEach(function(item) {
      let producto = tienda.obtenerProducto(item.id);
      if (!producto) {
        return;
      }

      let elemento = tienda.crearElemento("li");
      let nombre = tienda.crearElemento("span", {
        textContent: producto.nombre + " x" + item.cantidad
      });
      let subtotal = tienda.crearElemento("strong", {
        textContent: tienda.formatearPrecio(producto.precio * item.cantidad)
      });
      elemento.append(nombre, subtotal);
      lista.appendChild(elemento);
    });

    let totalResumen = tienda.crearElemento("p", { className: "total-checkout" });
    let etiquetaTotal = tienda.crearElemento("span", { textContent: "Total" });
    let valorTotal = tienda.crearElemento("strong", { textContent: tienda.formatearPrecio(total) });
    totalResumen.append(etiquetaTotal, valorTotal);
    resumenCheckout.append(lista, totalResumen);
    formularioPedido.hidden = false;
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

  function obtenerEntregaSeleccionada() {
    return tienda.obtenerRadioSeleccionado(formularioPedido, "entrega");
  }

  function validarFormulario() {
    let errores = [];
    let nombre = document.getElementById("nombre-pedido");
    let telefono = document.getElementById("telefono-pedido");
    let aceptacion = document.getElementById("aceptar-pedido");
    let entrega = obtenerEntregaSeleccionada();

    limpiarError(nombre, "error-nombre");
    limpiarError(telefono, "error-telefono");
    limpiarError(campoHabitacion, "error-habitacion");
    limpiarError(aceptacion, "error-aceptacion");

    if (!carrito.length) {
      errores.push({ campo: nombre, mensaje: "Agrega productos antes de continuar." });
    }

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
      errores[0].campo.focus();
      return false;
    }

    resumenErrores.hidden = true;
    resumenErrores.textContent = "";
    return true;
  }

  function armarDetallePedido(datos, carritoConfirmado, numeroPedido) {
    let lineasProductos = carritoConfirmado.map(function(item) {
      let producto = tienda.obtenerProducto(item.id);
      return "• " + producto.nombre + " x" + item.cantidad + " — " + tienda.formatearPrecio(producto.precio * item.cantidad);
    });
    let total = tienda.obtenerTotal(carritoConfirmado);
    let lineas = [
      "Hola Hotel Mayolo. Quiero confirmar el pedido " + numeroPedido + ".",
      "",
      "Productos:",
      lineasProductos.join("\n"),
      "Total: " + tienda.formatearPrecio(total),
      "Pago simulado: " + datos.pago,
      "",
      "Nombre: " + datos.nombre,
      "Teléfono: " + datos.telefono,
      "Entrega: " + (datos.entrega === "Habitación" ? datos.entrega + " " + datos.habitacion : datos.entrega)
    ];

    if (datos.nota) {
      lineas.push("Indicación: " + datos.nota);
    }

    return tienda.codificarLineasWhatsApp(lineas);
  }

  function confirmarPedido(evento) {
    evento.preventDefault();
    if (!validarFormulario()) {
      return;
    }

    let carritoConfirmado = carrito.map(function(item) {
      return { id: item.id, cantidad: item.cantidad };
    });
    let entrega = obtenerEntregaSeleccionada();
    let pago = tienda.obtenerRadioSeleccionado(formularioPedido, "pago");
    let datos = {
      nombre: document.getElementById("nombre-pedido").value.trim(),
      telefono: document.getElementById("telefono-pedido").value.trim(),
      entrega: entrega,
      pago: pago,
      habitacion: campoHabitacion.value.trim(),
      nota: document.getElementById("nota-pedido").value.trim()
    };
    let numeroPedido = "MAY-" + String(Date.now()).slice(-6);
    let total = tienda.obtenerTotal(carritoConfirmado);
    let detalle = armarDetallePedido(datos, carritoConfirmado, numeroPedido);
    let cantidadConfirmada = tienda.obtenerCantidadTotal(carritoConfirmado);

    enlaceWhatsApp.href = "https://wa.me/" + tienda.WHATSAPP_HOTEL + "?text=" + detalle;
    textoConfirmacion.textContent = numeroPedido + " incluye " + cantidadConfirmada + (cantidadConfirmada === 1 ? " producto" : " productos") + " por " + tienda.formatearPrecio(total) + ". El pago quedó simulado como: " + pago + ".";

    carrito = [];
    tienda.guardarCarrito(carrito);
    contadorCarrito.textContent = "0";
    formularioPedido.reset();
    formularioPedido.hidden = true;
    confirmacionPagina.hidden = false;
    document.getElementById("titulo-confirmacion").focus();
  }

  function actualizarCampoHabitacion() {
    let entrega = obtenerEntregaSeleccionada();
    let necesitaHabitacion = entrega === "Habitación";
    campoHabitacionContenedor.hidden = !necesitaHabitacion;
    campoHabitacion.required = necesitaHabitacion;
    if (!necesitaHabitacion) {
      campoHabitacion.value = "";
      limpiarError(campoHabitacion, "error-habitacion");
    }
  }

  formularioPedido.addEventListener("submit", confirmarPedido);
  formularioPedido.querySelectorAll('input[name="entrega"]').forEach(function(opcion) {
    opcion.addEventListener("change", actualizarCampoHabitacion);
  });

  renderizarResumen();
  actualizarCampoHabitacion();
})();
