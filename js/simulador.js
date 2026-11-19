"use strict";

const porId = (id) => document.getElementById(id);
const campos = ["masa", "capacidad", "tiempo"].map(porId);
const subir = porId("subir");
const caer = porId("caer");
const pausar = porId("pausar");
const estado = porId("estado");
const aviso = porId("validacion");
const visor = document.querySelector(".visor");
const formato = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 4 });
const n = (valor) => {
  if (valor !== 0 && Math.abs(valor) < 0.00005) return valor.toExponential(2).replace(".", ",");
  return formato.formatToParts(valor).map(({ type, value }) => {
    if (type === "group") return "\u202f";
    if (type === "decimal") return ",";
    return value;
  }).join("");
};
const { altura, gravedad, calcular, alturaIzaje, alturaCaida, duracionCaida } = FisicaIzaje;

let datos;
let modo = null;
let fase = "reposo";
let transcurrido = 0;
let origen = 0;
let cuadro = 0;

function ponerTarjetas(panel, filas) {
  panel.replaceChildren(...filas.map(([nombre, formula, sustitucion, resultado, explicacion]) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "panel tarjeta";
    for (const [tag, clase, texto] of [
      ["h3", "", nombre], ["p", "ecuacion", formula], ["p", "sustitucion", sustitucion],
      ["p", "resultado", resultado], ["p", "explicacion", explicacion]
    ]) {
      const elemento = document.createElement(tag);
      elemento.className = clase;
      if (clase === "ecuacion") {
        texto.split(/(_[a-zá]+)/g).forEach((parte) => {
          if (parte.startsWith("_")) {
            const subindice = document.createElement("sub");
            subindice.textContent = parte.slice(1);
            elemento.append(subindice);
          } else {
            elemento.append(parte);
          }
        });
      } else {
        elemento.textContent = texto;
      }
      tarjeta.append(elemento);
    }
    return tarjeta;
  }));
}

function mostrarCalculos() {
  const { masa, capacidad, tiempo, valores } = datos;
  const m = n(masa);
  const c = n(capacidad);
  const t = n(tiempo);
  const g = n(gravedad);
  const h = n(altura);
  const tension = n(valores.tension);
  const trabajo = n(valores.trabajo);
  const mgh = `${m} kg × ${g} m/s² × ${h} m`;
  ponerTarjetas(porId("formulas"), [
    ["Peso", "w = m × g", `${m} kg × ${g} m/s²`, `${n(valores.peso)} N`, "Fuerza gravitatoria sobre la carga, dirigida hacia abajo."],
    ["Tensión del cable", "T = m × g", `${m} kg × ${g} m/s²`, `${n(valores.tension)} N`, "Con un solo cable vertical y velocidad constante, la aceleración es cero y la tensión equilibra el peso."],
    ["Energía potencial ganada", "ΔUₚ = m × g × h", mgh, `${n(valores.energia)} J`, "Aumento de energía potencial gravitatoria respecto al suelo."],
    ["Trabajo del cable", "W_cable = T × h", `${tension} N × ${h} m`, `${trabajo} J`, "Trabajo positivo del cable durante el ascenso ideal, sin pérdidas."],
    ["Potencia mecánica ideal media", "P = W_cable / t", `${trabajo} J ÷ ${t} s`, `${n(valores.potencia)} W`, "Cálculo complementario. Representa el trabajo ideal por unidad de tiempo."],
    ["Velocidad media de ascenso", "vₘ = h / t", `${h} m ÷ ${t} s`, `${n(valores.velocidad)} m/s`, "Altura recorrida dividida por el tiempo. En el modelo de ascenso es constante."],
    ["Altura durante el izaje", "y(t) = y₀ + v × t", `0 m + (${n(valores.velocidad)} m/s × t)`, "De 0 m a 45 m", "En esta ecuación, t es el tiempo transcurrido desde el inicio. La altura aumenta linealmente hasta el piso 15."],
    ["Uso de capacidad", "Uso = (m / C) × 100 %", `(${m} kg ÷ ${c} kg) × 100 %`, `${n(valores.porcentaje)} %`, "Porcentaje de la capacidad nominal hipotética que representa la masa ingresada."],
    ["Margen de capacidad", "Margen = C − m", `${c} kg − ${m} kg`, `${n(valores.margen)} kg`, "Diferencia entre capacidad y carga. Un margen negativo indica sobrecarga y cero indica el límite configurado."]
  ]);
}

function mostrarCaida() {
  ponerTarjetas(porId("formulas-caida"), [
    ["Altura durante la caída", "y(t) = y₀ + v₀ × t − g × t² / 2", `${n(altura)} m − (${n(gravedad)} m/s² × t²) / 2`, "De 45 m a 0 m", "La carga parte del reposo. Aquí t es el tiempo desde la liberación. La animación se detiene al llegar al suelo."],
    ["Duración de la caída ideal", "t_caída = √(2 × h / g)", `√(2 × ${n(altura)} m ÷ ${n(gravedad)} m/s²)`, `${n(duracionCaida)} s`, "Se obtiene al igualar la altura a cero. En este modelo el tiempo de caída es independiente de la masa."]
  ]);
}

function dibujar(posicion) {
  visor.style.setProperty("--avance", posicion / altura);
  porId("altura-actual").textContent = `${n(posicion)} m`;
  porId("tiempo-actual").textContent = `${n(transcurrido)} s`;
  porId("carga").textContent = datos ? `${n(datos.masa)} kg` : "—";
}

function actualizarControles() {
  const ocupado = fase === "movimiento" || fase === "pausa";
  subir.disabled = !datos || datos.valores.sobrecarga || ocupado;
  caer.disabled = !datos || ocupado;
  pausar.disabled = !ocupado;
  pausar.textContent = fase === "pausa" ? "Reanudar" : "Pausar";
}

function reiniciar() {
  cancelAnimationFrame(cuadro);
  fase = "reposo";
  modo = null;
  transcurrido = 0;
  visor.classList.remove("modo-caida");
  porId("formulas-caida").hidden = true;
  estado.textContent = "En espera";
  dibujar(0);
  actualizarControles();
}

function leerParametros() {
  const [masa, capacidad, tiempo] = campos.map((campo) => campo.valueAsNumber);
  const validos = campos.every((campo) => campo.validity.valid && Number.isFinite(campo.valueAsNumber));
  campos.forEach((campo) => campo.setAttribute("aria-invalid", String(!campo.validity.valid)));
  datos = validos ? { masa, capacidad, tiempo, valores: calcular(masa, capacidad, tiempo) } : null;
  reiniciar();
  aviso.classList.toggle("peligro", !datos || datos.valores.sobrecarga);
  if (!datos) {
    aviso.textContent = "Ingresa masas entre 0,01 y 1 000 000 kg y un tiempo entre 0,1 y 3600 s.";
    porId("formulas").replaceChildren();
    return;
  }
  if (datos.valores.sobrecarga) {
    aviso.textContent = `Sobrecarga de ${n(-datos.valores.margen)} kg. Ascenso bloqueado.`;
  } else if (datos.valores.margen === 0) {
    aviso.textContent = "Carga igual a la capacidad nominal hipotética. Ascenso habilitado en el modelo.";
  } else {
    aviso.textContent = `Margen nominal de ${n(datos.valores.margen)} kg. Ascenso habilitado en el modelo.`;
  }
  mostrarCalculos();
}

function avanzar(ahora) {
  if (fase !== "movimiento") return;
  const esCaida = modo === "caida";
  const duracion = esCaida ? duracionCaida : datos.tiempo;
  transcurrido = Math.min(Math.max(0, (ahora - origen) / 1000), duracion);
  dibujar(esCaida ? alturaCaida(transcurrido) : alturaIzaje(transcurrido, duracion));
  if (transcurrido < duracion) {
    cuadro = requestAnimationFrame(avanzar);
    return;
  }
  fase = "terminado";
  estado.textContent = esCaida ? "Fin de la caída · suelo" : "Izaje completado · piso 15";
  actualizarControles();
}

function continuar() {
  fase = "movimiento";
  origen = performance.now() - transcurrido * 1000;
  estado.textContent = modo === "caida" ? "Caída hipotética" : "Carga en ascenso";
  cuadro = requestAnimationFrame(avanzar);
  actualizarControles();
}

function iniciar(escenario) {
  const esCaida = escenario === "caida";
  if (esCaida ? caer.disabled : subir.disabled) return;
  reiniciar();
  modo = escenario;
  visor.classList.toggle("modo-caida", esCaida);
  porId("formulas-caida").hidden = !esCaida;
  dibujar(esCaida ? altura : 0);
  continuar();
}

campos.forEach((campo) => campo.addEventListener("input", leerParametros));
subir.addEventListener("click", () => iniciar("izaje"));
caer.addEventListener("click", () => iniciar("caida"));
porId("reiniciar").addEventListener("click", reiniciar);
pausar.addEventListener("click", () => {
  if (fase === "pausa") {
    continuar();
  } else if (fase === "movimiento") {
    cancelAnimationFrame(cuadro);
    fase = "pausa";
    estado.textContent = modo === "caida" ? "Caída pausada" : "Izaje pausado";
    actualizarControles();
  }
});
mostrarCaida();
leerParametros();
