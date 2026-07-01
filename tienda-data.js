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

  function obtenerProducto(id) {
    return productos.find(function(producto) {
      return producto.id === id;
    });
  }

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

  function guardarCarrito(carrito) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    window.dispatchEvent(new CustomEvent("mayolo:carrito-actualizado", {
      detail: {
        cantidad: obtenerCantidadTotal(carrito),
        total: obtenerTotal(carrito)
      }
    }));
  }

  function normalizarTexto(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function formatearPrecio(precio) {
    return "S/ " + precio.toFixed(2);
  }

  function obtenerCantidadTotal(carrito) {
    return carrito.reduce(function(total, item) {
      return total + item.cantidad;
    }, 0);
  }

  function obtenerTotal(carrito) {
    return carrito.reduce(function(total, item) {
      let producto = obtenerProducto(item.id);
      return producto ? total + producto.precio * item.cantidad : total;
    }, 0);
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

  function configurarMenuResponsive(boton, menu, breakpoint) {
    breakpoint = breakpoint || 920;

    function cerrar() {
      if (!boton || !menu) {
        return;
      }

      menu.classList.remove("abierto");
      boton.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
    }

    function alternar() {
      if (!boton || !menu) {
        return;
      }

      let abierto = menu.classList.toggle("abierto");
      boton.classList.toggle("abierto", abierto);
      boton.setAttribute("aria-expanded", String(abierto));
      boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    }

    if (boton && menu) {
      boton.addEventListener("click", alternar);
      menu.querySelectorAll("a").forEach(function(enlace) {
        enlace.addEventListener("click", cerrar);
      });
      window.addEventListener("resize", function() {
        if (window.innerWidth > breakpoint) {
          cerrar();
        }
      });
    }

    return {
      cerrar: cerrar,
      alternar: alternar
    };
  }

  function obtenerRadioSeleccionado(formulario, nombre) {
    let seleccionado = formulario.querySelector('input[name="' + nombre + '"]:checked');
    return seleccionado ? seleccionado.value : "";
  }

  function codificarLineasWhatsApp(lineas) {
    return lineas.join("\n").split("\n").map(function(linea) {
      return encodeURIComponent(linea);
    }).join("%0A");
  }

  window.MayoloTienda = {
    WHATSAPP_HOTEL: WHATSAPP_HOTEL,
    CLAVE_CARRITO: CLAVE_CARRITO,
    productos: productos,
    cargarCarrito: cargarCarrito,
    guardarCarrito: guardarCarrito,
    normalizarTexto: normalizarTexto,
    formatearPrecio: formatearPrecio,
    obtenerProducto: obtenerProducto,
    obtenerCantidadTotal: obtenerCantidadTotal,
    obtenerTotal: obtenerTotal,
    crearElemento: crearElemento,
    configurarMenuResponsive: configurarMenuResponsive,
    obtenerRadioSeleccionado: obtenerRadioSeleccionado,
    codificarLineasWhatsApp: codificarLineasWhatsApp
  };
})();
