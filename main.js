(function() {
  "use strict";

const WHATSAPP_HOTEL = "51944216425";

const botonMenu = document.getElementById("boton-menu");
const menuNav = document.getElementById("menu-navegacion");

function alternarMenu() {
  let abierto = menuNav.classList.toggle("abierto");
  botonMenu.classList.toggle("abierto", abierto);
  botonMenu.setAttribute("aria-expanded", String(abierto));
  botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}

function cerrarMenu() {
  menuNav.classList.remove("abierto");
  botonMenu.classList.remove("abierto");
  botonMenu.setAttribute("aria-expanded", "false");
  botonMenu.setAttribute("aria-label", "Abrir menú");
}

botonMenu.addEventListener("click", alternarMenu);

const enlacesMenu = menuNav.querySelectorAll("a");
enlacesMenu.forEach(function(enlace) {
  enlace.addEventListener("click", cerrarMenu);
});

window.addEventListener("resize", function() {
  if (window.innerWidth > 900) {
    cerrarMenu();
  }
});

function iniciarDeslizamientoAutomatico(selectorContenedor, selectorItem, selectorPista) {
  let carrusel = document.querySelector(selectorContenedor);

  if (!carrusel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let consultaMovil = window.matchMedia("(max-width: 760px)");
  let temporizador = null;
  let pausaUsuario = null;

  function calcularAvance() {
    let item = carrusel.querySelector(selectorItem);
    let pista = selectorPista ? carrusel.querySelector(selectorPista) : carrusel;

    if (!item || !pista) {
      return carrusel.clientWidth;
    }

    let estilos = window.getComputedStyle(pista);
    let separacion = parseFloat(estilos.columnGap || estilos.gap) || 0;
    return item.getBoundingClientRect().width + separacion;
  }

  function avanzar() {
    if (!consultaMovil.matches || document.hidden) {
      return;
    }

    let limite = carrusel.scrollWidth - carrusel.clientWidth - 2;

    if (limite <= 0) {
      return;
    }

    let actual = carrusel.scrollLeft;
    let siguiente = Math.min(actual + calcularAvance(), limite);

    if (actual >= limite - 4) {
      siguiente = 0;
    }

    carrusel.scrollTo({
      left: siguiente,
      behavior: "smooth"
    });
  }

  function iniciar() {
    if (!consultaMovil.matches || temporizador) {
      return;
    }

    temporizador = window.setInterval(avanzar, 3600);
  }

  function detener() {
    window.clearInterval(temporizador);
    temporizador = null;
  }

  function pausarTemporalmente() {
    detener();
    window.clearTimeout(pausaUsuario);
    pausaUsuario = window.setTimeout(iniciar, 6500);
  }

  function responderAlTamano() {
    if (consultaMovil.matches) {
      iniciar();
    } else {
      detener();
      carrusel.scrollLeft = 0;
    }
  }

  carrusel.addEventListener("pointerdown", pausarTemporalmente);
  carrusel.addEventListener("focusin", pausarTemporalmente);
  carrusel.addEventListener("mouseenter", detener);
  carrusel.addEventListener("mouseleave", iniciar);
  document.addEventListener("visibilitychange", responderAlTamano);

  if (consultaMovil.addEventListener) {
    consultaMovil.addEventListener("change", responderAlTamano);
  } else {
    consultaMovil.addListener(responderAlTamano);
  }

  responderAlTamano();
}

iniciarDeslizamientoAutomatico(".lista-habitaciones", ".tarjeta-habitacion", ".cuadricula-habitaciones");
iniciarDeslizamientoAutomatico(".cuadricula-amenidades", ".amenidad");
iniciarDeslizamientoAutomatico(".cuadricula-galeria", ".elemento-galeria");
iniciarDeslizamientoAutomatico(".cuadricula-resenas", ".tarjeta-resena");

const visor = document.getElementById("visor-galeria");
const contenidoVisor = document.getElementById("contenido-visor");
const botonCerrarVisor = document.getElementById("cerrar-visor");
let focoAntesDelVisor = null;

function actualizarFondoInerte(inerte) {
  [document.querySelector("header"), document.querySelector("main"), document.querySelector("footer"), document.querySelector(".whatsapp-flotante")].forEach(function(elemento) {
    if (elemento) {
      elemento.inert = inerte;
    }
  });
}

function abrirVisor(tipo, ruta, descripcion) {
  focoAntesDelVisor = document.activeElement;
  contenidoVisor.replaceChildren();

  if (tipo === "video") {
    let video = document.createElement("video");
    video.src = ruta;
    video.controls = true;
    video.autoplay = true;
    video.setAttribute("aria-label", descripcion);

    let subtitulos = document.createElement("track");
    subtitulos.kind = "captions";
    subtitulos.label = "Español";
    subtitulos.srclang = "es";
    subtitulos.src = ruta.replace(".mp4", ".vtt");
    subtitulos.default = true;
    video.appendChild(subtitulos);
    contenidoVisor.appendChild(video);
  } else {
    let imagen = document.createElement("img");
    imagen.src = ruta;
    imagen.alt = descripcion;
    contenidoVisor.appendChild(imagen);
  }

  visor.classList.add("visible");
  visor.setAttribute("aria-hidden", "false");
  document.body.classList.add("bloqueado");
  actualizarFondoInerte(true);
  botonCerrarVisor.focus();
}

function cerrarVisor() {
  if (!visor.classList.contains("visible")) {
    return;
  }

  visor.classList.remove("visible");
  visor.setAttribute("aria-hidden", "true");
  document.body.classList.remove("bloqueado");
  actualizarFondoInerte(false);
  contenidoVisor.replaceChildren();

  if (focoAntesDelVisor && document.contains(focoAntesDelVisor)) {
    focoAntesDelVisor.focus();
  }
}

visor.addEventListener("click", function(evento) {
  if (evento.target === visor) {
    cerrarVisor();
  }
});

document.addEventListener("keydown", function(evento) {
  if (evento.key === "Escape") {
    cerrarMenu();
    cerrarVisor();
  }
});

const campoLlegada = document.getElementById("llegada");
const campoSalida = document.getElementById("salida");
const campoHabitacion = document.getElementById("habitacion");

function formatearFecha(fecha) {
  let ano = fecha.getFullYear();
  let mes = String(fecha.getMonth() + 1).padStart(2, "0");
  let dia = String(fecha.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function actualizarSalidaMinima() {
  if (!campoLlegada.value) {
    return;
  }

  let fechaLlegada = new Date(campoLlegada.value + "T00:00:00");
  fechaLlegada.setDate(fechaLlegada.getDate() + 1);

  let salidaMinima = formatearFecha(fechaLlegada);
  campoSalida.min = salidaMinima;

  if (campoSalida.value && campoSalida.value < salidaMinima) {
    campoSalida.value = "";
  }
}

function seleccionarHabitacion(tipo) {
  campoHabitacion.value = tipo;
}

campoLlegada.min = formatearFecha(new Date());
campoLlegada.addEventListener("change", actualizarSalidaMinima);

document.querySelectorAll("[data-habitacion]").forEach(function(enlace) {
  enlace.addEventListener("click", function() {
    seleccionarHabitacion(enlace.dataset.habitacion);
  });
});

document.querySelectorAll("[data-visor-ruta]").forEach(function(boton) {
  boton.addEventListener("click", function() {
    abrirVisor(boton.dataset.visorTipo, boton.dataset.visorRuta, boton.dataset.visorDescripcion);
  });
});

botonCerrarVisor.addEventListener("click", cerrarVisor);

const formulario = document.getElementById("formulario-reserva");
const estado = document.getElementById("estado-formulario");

function armarMensajeWhatsApp() {
  let nombre = document.getElementById("nombre").value;
  let correo = document.getElementById("correo").value;
  let telefono = document.getElementById("telefono").value;
  let llegada = document.getElementById("llegada").value;
  let salida = document.getElementById("salida").value;
  let habitacion = document.getElementById("habitacion").value;
  let mensaje = document.getElementById("mensaje").value.trim();

  let texto = "Hola Hotel Mayolo, soy " + nombre + ". ";
  texto += "Deseo consultar disponibilidad para una habitación " + habitacion;
  texto += ", del " + llegada + " al " + salida + ". ";
  texto += "Mi teléfono es " + telefono + " y mi correo es " + correo + ".";

  if (mensaje) {
    texto += " " + mensaje;
  }

  return texto;
}

formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  let campoInvalido = formulario.querySelector(":invalid");
  if (campoInvalido) {
    let mensajes = {
      nombre: "Escribe tu nombre completo.",
      correo: "Ingresa un correo válido; por ejemplo, nombre@correo.com.",
      telefono: "Ingresa un número de teléfono para poder contactarte.",
      llegada: "Selecciona la fecha de llegada.",
      salida: "Selecciona una fecha de salida posterior a la llegada.",
      habitacion: "Selecciona el tipo de habitación que necesitas."
    };
    let mensajeError = mensajes[campoInvalido.id] || "Revisa este campo antes de continuar.";

    estado.setAttribute("role", "alert");
    estado.textContent = mensajeError;
    campoInvalido.setAttribute("aria-invalid", "true");
    campoInvalido.setAttribute("aria-describedby", "estado-formulario");
    campoInvalido.focus();
    return;
  }

  let mensajeTexto = armarMensajeWhatsApp();
  let urlWhatsApp = "https://wa.me/" + WHATSAPP_HOTEL + "?text=" + encodeURIComponent(mensajeTexto);

  estado.textContent = "Consulta lista. Abriremos WhatsApp para enviarla.";
  window.open(urlWhatsApp, "_blank");

  formulario.reset();
  campoSalida.min = "";
});

formulario.querySelectorAll("input, select, textarea").forEach(function(campo) {
  campo.addEventListener("input", function() {
    campo.removeAttribute("aria-invalid");
    campo.removeAttribute("aria-describedby");
    if (estado.getAttribute("role") === "alert") {
      estado.textContent = "";
      estado.setAttribute("role", "status");
    }
  });
});

const contadorCarritoPrincipal = document.getElementById("contador-carrito-principal");
const enlaceCarritoPrincipal = document.querySelector(".enlace-carrito");

function actualizarContadorCarritoPrincipal() {
  if (!contadorCarritoPrincipal) {
    return;
  }

  let cantidad = 0;
  try {
    let carritoGuardado = JSON.parse(localStorage.getItem("hotel-mayolo-carrito"));
    if (Array.isArray(carritoGuardado)) {
      cantidad = carritoGuardado.reduce(function(total, item) {
        return total + (Number.isInteger(item.cantidad) && item.cantidad > 0 ? item.cantidad : 0);
      }, 0);
    }
  } catch (error) {
    cantidad = 0;
  }

  contadorCarritoPrincipal.textContent = cantidad;
  enlaceCarritoPrincipal.setAttribute("aria-label", "Abrir el carrito de compras, " + cantidad + (cantidad === 1 ? " producto" : " productos"));
}

actualizarContadorCarritoPrincipal();
window.addEventListener("pageshow", actualizarContadorCarritoPrincipal);
window.addEventListener("storage", actualizarContadorCarritoPrincipal);
})();
