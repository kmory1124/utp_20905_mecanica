"use strict";

const FisicaIzaje = (() => {
  const altura = 45;
  const gravedad = 9.81;

  function calcular(masa, capacidad, tiempo) {
    const peso = masa * gravedad;
    const energia = peso * altura;
    return {
      peso,
      tension: peso,
      energia,
      trabajo: energia,
      potencia: energia / tiempo,
      velocidad: altura / tiempo,
      porcentaje: masa / capacidad * 100,
      margen: capacidad - masa,
      sobrecarga: masa > capacidad
    };
  }

  function alturaIzaje(tiempo, duracion) {
    return altura * Math.min(tiempo / duracion, 1);
  }

  const duracionCaida = Math.sqrt(2 * altura / gravedad);

  function alturaCaida(tiempo) {
    return Math.max(0, altura - gravedad * tiempo ** 2 / 2);
  }

  return { altura, gravedad, calcular, alturaIzaje, duracionCaida, alturaCaida };
})();
