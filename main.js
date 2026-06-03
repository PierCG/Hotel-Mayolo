var WHATSAPP_HOTEL = "51944216425";

var botonMenu = document.getElementById("boton-menu");
var menuNav = document.getElementById("menu-navegacion");

function alternarMenu() {
  menuNav.classList.toggle("abierto");
  botonMenu.classList.toggle("abierto");
}

function cerrarMenu() {
  menuNav.classList.remove("abierto");
  botonMenu.classList.remove("abierto");
}

botonMenu.addEventListener("click", alternarMenu);

var enlacesMenu = menuNav.querySelectorAll("a");
enlacesMenu.forEach(function(enlace) {
  enlace.addEventListener("click", cerrarMenu);
});

window.addEventListener("resize", function() {
  if (window.innerWidth > 900) {
    cerrarMenu();
  }
});

var visor = document.getElementById("visor-galeria");
var contenidoVisor = document.getElementById("contenido-visor");

function abrirVisor(tipo, ruta, descripcion) {
  contenidoVisor.innerHTML = "";

  if (tipo === "video") {
    var video = document.createElement("video");
    video.src = ruta;
    video.controls = true;
    video.autoplay = true;
    contenidoVisor.appendChild(video);
  } else {
    var imagen = document.createElement("img");
    imagen.src = ruta;
    imagen.alt = descripcion;
    contenidoVisor.appendChild(imagen);
  }

  visor.classList.add("visible");
  document.body.classList.add("bloqueado");
}

function cerrarVisor() {
  visor.classList.remove("visible");
  document.body.classList.remove("bloqueado");
  contenidoVisor.innerHTML = "";
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

var campoLlegada = document.getElementById("llegada");
var campoSalida = document.getElementById("salida");
var campoHabitacion = document.getElementById("habitacion");

function formatearFecha(fecha) {
  var ano = fecha.getFullYear();
  var mes = String(fecha.getMonth() + 1).padStart(2, "0");
  var dia = String(fecha.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function actualizarSalidaMinima() {
  if (!campoLlegada.value) {
    return;
  }

  var fechaLlegada = new Date(campoLlegada.value + "T00:00:00");
  fechaLlegada.setDate(fechaLlegada.getDate() + 1);

  var salidaMinima = formatearFecha(fechaLlegada);
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

var formulario = document.getElementById("formulario-reserva");
var estado = document.getElementById("estado-formulario");

function armarMensajeWhatsApp() {
  var nombre = document.getElementById("nombre").value;
  var correo = document.getElementById("correo").value;
  var telefono = document.getElementById("telefono").value;
  var llegada = document.getElementById("llegada").value;
  var salida = document.getElementById("salida").value;
  var habitacion = document.getElementById("habitacion").value;
  var mensaje = document.getElementById("mensaje").value.trim();

  var texto = "Hola Hotel Mayolo, soy " + nombre + ". ";
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

  var mensajeTexto = armarMensajeWhatsApp();
  var urlWhatsApp = "https://wa.me/" + WHATSAPP_HOTEL + "?text=" + encodeURIComponent(mensajeTexto);

  estado.textContent = "Consulta lista. Abriremos WhatsApp para enviarla.";
  window.open(urlWhatsApp, "_blank");

  formulario.reset();
  campoSalida.min = "";
});
