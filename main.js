(() => {
  "use strict";

  const TELEFONO_HOTEL = "51944216425";
  const SELECTORES = {
    botonHabitacion: "[data-habitacion]",
    botonMenu: ".boton-menu",
    contadorEstadistica: "[data-contador]",
    elementoGaleria: ".elemento-galeria",
    formularioReserva: "#formulario-reserva",
    menuNavegacion: "#menu-navegacion",
    miniaturaVideo: ".miniatura-video video",
    revelar: ".revelar",
    visorGaleria: "#visor-galeria",
  };

  const seleccionar = (selector, contexto = document) => contexto.querySelector(selector);
  const seleccionarTodos = (selector, contexto = document) => [...contexto.querySelectorAll(selector)];

  function actualizarEstadoNavegacion(boton, menu, estaAbierto) {
    menu.classList.toggle("esta-abierto", estaAbierto);
    boton.setAttribute("aria-expanded", String(estaAbierto));
    boton.setAttribute("aria-label", estaAbierto ? "Cerrar menú" : "Abrir menú");
  }

  function inicializarNavegacion() {
    const boton = seleccionar(SELECTORES.botonMenu);
    const menu = seleccionar(SELECTORES.menuNavegacion);

    if (!boton || !menu) return;

    boton.addEventListener("click", () => {
      const estaAbierto = boton.getAttribute("aria-expanded") !== "true";
      actualizarEstadoNavegacion(boton, menu, estaAbierto);
    });

    seleccionarTodos("a", menu).forEach((enlace) => {
      enlace.addEventListener("click", () => actualizarEstadoNavegacion(boton, menu, false));
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") actualizarEstadoNavegacion(boton, menu, false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) actualizarEstadoNavegacion(boton, menu, false);
    });
  }

  function inicializarAnimacionesRevelado() {
    const elementos = seleccionarTodos(SELECTORES.revelar);
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducirMovimiento || !("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("visible"));
      return;
    }

    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.14 });

    elementos.forEach((elemento) => observador.observe(elemento));
  }

  function inicializarContadoresEstadisticas() {
    const contadores = seleccionarTodos(SELECTORES.contadorEstadistica);
    const estadisticas = seleccionar(".estadisticas");
    const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function formatearContador(contador, valor) {
      return `${contador.dataset.prefijo ?? ""}${valor}${contador.dataset.sufijo ?? ""}`;
    }

    function animarContador(contador) {
      const objetivo = Number.parseInt(contador.dataset.objetivo ?? "", 10);

      if (!Number.isFinite(objetivo)) return;

      if (reducirMovimiento) {
        contador.textContent = formatearContador(contador, objetivo);
        return;
      }

      const duracion = 1200;
      const tiempoInicial = performance.now();
      contador.classList.add("esta-contando");

      function actualizarContador(tiempoActual) {
        const progreso = Math.min((tiempoActual - tiempoInicial) / duracion, 1);
        const progresoSuavizado = 1 - Math.pow(1 - progreso, 3);
        contador.textContent = formatearContador(contador, Math.round(objetivo * progresoSuavizado));

        if (progreso < 1) {
          requestAnimationFrame(actualizarContador);
        } else {
          contador.classList.remove("esta-contando");
        }
      }

      requestAnimationFrame(actualizarContador);
    }

    if (reducirMovimiento || !("IntersectionObserver" in window)) {
      estadisticas?.classList.add("esta-animado");
      contadores.forEach(animarContador);
      return;
    }

    if (estadisticas) {
      const observadorEstadisticas = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;

          entrada.target.classList.add("esta-animado");
          observadorEstadisticas.unobserve(entrada.target);
        });
      }, { threshold: 0.42 });

      observadorEstadisticas.observe(estadisticas);
    }

    const observadorContadores = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        animarContador(entrada.target);
        observadorContadores.unobserve(entrada.target);
      });
    }, { threshold: 0.7 });

    contadores.forEach((contador) => {
      contador.textContent = formatearContador(contador, 0);
      observadorContadores.observe(contador);
    });
  }

  function inicializarBotonesHabitacion() {
    const selectorHabitacion = seleccionar("#habitacion");

    if (!selectorHabitacion) return;

    seleccionarTodos(SELECTORES.botonHabitacion).forEach((boton) => {
      boton.addEventListener("click", () => {
        selectorHabitacion.value = boton.dataset.habitacion ?? "";
      });
    });
  }

  function crearMedioVisor(elemento) {
    const ruta = elemento.dataset.ruta;

    if (!ruta) return null;

    if (elemento.dataset.medio === "video") {
      const video = document.createElement("video");
      video.src = ruta;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      return video;
    }

    const imagen = document.createElement("img");
    imagen.src = ruta;
    imagen.alt = seleccionar("img", elemento)?.alt ?? "Vista ampliada del Hotel Mayolo";
    return imagen;
  }

  function inicializarVisorGaleria() {
    const visor = seleccionar(SELECTORES.visorGaleria);
    const contenido = visor ? seleccionar(".contenido-visor", visor) : null;
    const botonCerrar = visor ? seleccionar("[data-cerrar-visor]", visor) : null;
    let elementoConFocoPrevio = null;

    if (!(visor instanceof HTMLDialogElement) || !contenido || !botonCerrar) return;

    function cerrarVisor() {
      if (visor.open) visor.close();
    }

    function limpiarVisor() {
      document.body.classList.remove("bloqueado");
      contenido.replaceChildren();
      elementoConFocoPrevio?.focus();
      elementoConFocoPrevio = null;
    }

    seleccionarTodos(SELECTORES.elementoGaleria).forEach((elemento) => {
      elemento.addEventListener("click", () => {
        const medio = crearMedioVisor(elemento);

        if (!medio) return;

        elementoConFocoPrevio = document.activeElement;
        contenido.replaceChildren(medio);
        document.body.classList.add("bloqueado");
        visor.showModal();
        botonCerrar.focus();
      });
    });

    botonCerrar.addEventListener("click", cerrarVisor);
    visor.addEventListener("close", limpiarVisor);
    visor.addEventListener("cancel", (evento) => {
      evento.preventDefault();
      cerrarVisor();
    });
    visor.addEventListener("click", (evento) => {
      if (evento.target === visor) cerrarVisor();
    });
    visor.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrarVisor();
      }
    });
  }

  function obtenerFechaLocalISO(fecha = new Date()) {
    const desfaseHorario = fecha.getTimezoneOffset() * 60_000;
    return new Date(fecha.getTime() - desfaseHorario).toISOString().slice(0, 10);
  }

  function sumarDias(fechaISO, dias) {
    const fecha = new Date(`${fechaISO}T00:00:00`);
    fecha.setDate(fecha.getDate() + dias);
    return obtenerFechaLocalISO(fecha);
  }

  function inicializarFechasReserva(formulario) {
    const campoLlegada = seleccionar("#llegada", formulario);
    const campoSalida = seleccionar("#salida", formulario);

    if (!campoLlegada || !campoSalida) return () => {};

    campoLlegada.min = obtenerFechaLocalISO();

    function actualizarFechaSalida() {
      const salidaMinima = campoLlegada.value
        ? sumarDias(campoLlegada.value, 1)
        : campoLlegada.min;

      campoSalida.min = salidaMinima;

      if (campoSalida.value && campoSalida.value < salidaMinima) {
        campoSalida.value = "";
      }
    }

    campoLlegada.addEventListener("change", actualizarFechaSalida);
    actualizarFechaSalida();
    return actualizarFechaSalida;
  }

  function crearMensajeWhatsApp(formulario) {
    const datos = new FormData(formulario);
    const detalles = [
      `Hola Hotel Mayolo, soy ${datos.get("nombre")}.`,
      `Deseo consultar disponibilidad para una habitación ${datos.get("habitacion")}, del ${datos.get("llegada")} al ${datos.get("salida")}.`,
      `Mi teléfono es ${datos.get("telefono")} y mi correo es ${datos.get("correo")}.`,
    ];
    const mensaje = datos.get("mensaje")?.trim();

    if (mensaje) detalles.push(mensaje);

    return detalles.join(" ");
  }

  function inicializarFormularioReserva() {
    const formulario = seleccionar(SELECTORES.formularioReserva);
    const estado = formulario ? seleccionar(".estado-formulario", formulario) : null;

    if (!formulario || !estado) return;

    const actualizarFechaSalida = inicializarFechasReserva(formulario);

    formulario.addEventListener("submit", (evento) => {
      evento.preventDefault();
      estado.classList.remove("tiene-error");

      if (!formulario.checkValidity()) {
        estado.textContent = "Completa los campos requeridos para preparar tu consulta.";
        estado.classList.add("tiene-error");
        formulario.reportValidity();
        return;
      }

      const urlWhatsApp = new URL(`https://wa.me/${TELEFONO_HOTEL}`);
      urlWhatsApp.searchParams.set("text", crearMensajeWhatsApp(formulario));

      estado.textContent = "Consulta lista. Abriremos WhatsApp para enviarla.";
      window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
      formulario.reset();
      actualizarFechaSalida();
    });
  }

  function inicializarVideosAlPasarCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    seleccionarTodos(SELECTORES.miniaturaVideo).forEach((video) => {
      const miniatura = video.closest(".miniatura-video");

      if (!miniatura) return;

      miniatura.addEventListener("mouseenter", () => video.play().catch(() => {}));
      miniatura.addEventListener("mouseleave", () => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  function inicializar() {
    inicializarNavegacion();
    inicializarAnimacionesRevelado();
    inicializarContadoresEstadisticas();
    inicializarBotonesHabitacion();
    inicializarVisorGaleria();
    inicializarFormularioReserva();
    inicializarVideosAlPasarCursor();
  }

  inicializar();
})();
