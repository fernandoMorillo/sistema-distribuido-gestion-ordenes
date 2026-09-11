const express = require("express");
const { Worker } = require("worker_threads");
const path = require("path");

const app = express();
app.use(express.json()); // Middleware para parsear el body

const PORT = 3001;

// Endpoint que recibe el tráfico desde el API Gateway (Proxy)
app.post("/", (req, res) => {
  const { cliente, items } = req.body;

  console.log(`[Órdenes] Recibiendo orden de: ${cliente}`);

  // 1. MANEJO DE HILOS: Delegamos la validación pesada al Worker Thread
  const workerPath = path.resolve(__dirname, "worker-validacion.js");
  const worker = new Worker(workerPath, { workerData: { items } });

  worker.on("message", (resultado) => {
    if (!resultado.valido) {
      return res.status(400).json({ error: resultado.mensaje });
    }

    // 2. SIMULACIÓN DE PERSISTENCIA (MongoDB)
    const nuevaOrden = {
      idOrden: `ORD-${Date.now()}`,
      cliente,
      estado: "En Proceso",
      timestamp: new Date(),
    };
    console.log(
      `[Órdenes] Orden guardada en MongoDB documental: ${nuevaOrden.idOrden}`,
    );

    // 3. PATRÓN OBSERVER: Emisión asíncrona del evento a la red (Fire-and-Forget)
    // Usamos fetch nativo  sin "await" para no bloquear la respuesta al cliente
    fetch("http://127.0.0.1:3002/api/eventos/orden-creada", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaOrden),
    }).catch((err) =>
      console.error(
        "[Órdenes] Error notificando al bus de eventos:",
        err.message,
      ),
    );

    // 4. RESPUESTA NO BLOQUEANTE AL CLIENTE
    // Retornamos un HTTP 202 (Accepted) inmediatamente.
    res.status(202).json({
      mensaje:
        "Orden recibida con éxito. El inventario se está procesando en segundo plano.",
      orden: nuevaOrden,
    });
  });

  worker.on("error", (err) => {
    console.error("[Órdenes] Error en el hilo secundario:", err);
    res.status(500).json({ error: "Error interno de validación" });
  });
});

app.listen(PORT, () => {
  console.log(`📦 Servicio de Órdenes escuchando en el puerto ${PORT}`);
});
