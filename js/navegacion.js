"use strict";

// El menú usa enlaces HTML. Las imágenes locales son opcionales.
document.querySelectorAll("[data-imagen]").forEach((espacio) => {
  const imagen = new Image();
  imagen.alt = espacio.dataset.alt;
  imagen.addEventListener("load", () => {
    const marcador = espacio.querySelector(".esquema-portada");
    if (marcador) {
      marcador.replaceWith(imagen);
      espacio.querySelector("figcaption").textContent = "Mecánica Clásica";
    } else {
      espacio.replaceChildren(imagen);
    }
  }, { once: true });
  imagen.src = espacio.dataset.imagen;
});
