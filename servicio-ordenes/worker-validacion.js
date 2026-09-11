const { parentPort, workerData } = require("worker_threads");

// workerData recibe los datos enviados por el hilo principal
const { items } = workerData;

// Simulamos una validación pesada (ej. cruzar datos con un JSON masivo en memoria)
let isValid = true;
const categoriasPermitidas = ["CO2", "ABC", "Agua"];

items.forEach((item) => {
  if (!categoriasPermitidas.includes(item.tipo)) {
    isValid = false;
  }
  // Simulación de retraso por procesamiento intensivo
  let sum = 0;
  for (let i = 0; i < 1e7; i++) sum += i;
});

// Enviamos el resultado de vuelta al hilo principal
parentPort.postMessage({
  valido: isValid,
  mensaje: isValid
    ? "Validación de equipos exitosa"
    : "Tipo de equipo no reconocido",
});
