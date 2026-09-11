const express = require("express");

const app = express();
app.use(express.json()); // Middleware para parsear el payload del evento

const PORT = 3002;

// Simulación de persistencia en motor Relacional (MySQL)
// En producción, aquí usariamos un Pool de conexiones (ej. con mysql2 o Sequelize)
const inventarioMySQL = {
  CO2: 500,
  ABC: 1500,
  Agua: 300,
};

// PATRÓN OBSERVER: Endpoint que actúa como "Listener" o "Subscriber"
// Escucha el evento emitido de forma asíncrona por el Servicio de Órdenes
app.post("/api/eventos/orden-creada", async (req, res) => {
  const orden = req.body;
  console.log(
    `[Inventario] 📥 Evento 'Orden Creada' recibido. ID: ${orden.idOrden}`,
  );

  try {
    // 1. Simulación de inicio de una Transacción SQL para garantizar ACID
    console.log(`[Inventario] 🔒 BEGIN TRANSACTION`);

    // En un caso real, iteraríamos sobre orden.items. Aquí simulamos el descuento:
    const tipoEquipo = "ABC";
    const cantidadSolicitada = 10;

    // 2. Validación de reglas de negocio críticas
    if (inventarioMySQL[tipoEquipo] >= cantidadSolicitada) {
      // 3. Ejecución de la operación
      inventarioMySQL[tipoEquipo] -= cantidadSolicitada;
      console.log(
        `[Inventario] ⚙️ UPDATE equipos SET stock = ${inventarioMySQL[tipoEquipo]} WHERE tipo = '${tipoEquipo}'`,
      );

      // 4. Confirmación
      console.log(`[Inventario] ✅ COMMIT`);
      res.status(200).json({ mensaje: "Inventario actualizado con éxito" });
    } else {
      throw new Error(`Stock insuficiente para el equipo ${tipoEquipo}`);
    }
  } catch (error) {
    // 5. Manejo de fallos sin afectar al frontend
    console.error(`[Inventario] ❌ ROLLBACK - ${error.message}`);

    // NOTA ARQUITECTÓNICA: Si esto falla, el cliente ya recibió un "202 Accepted".
    // En un sistema robusto, aquí emitiríamos un nuevo evento (ej. "OrdenRechazada")
    // para que el Servicio de Órdenes actualice el estado en MongoDB (Patrón Saga).
    res.status(500).json({ error: "Fallo en conciliación de inventario" });
  }
});

app.listen(PORT, () => {
  console.log(`🛠️ Servicio de Inventario escuchando en el puerto ${PORT}`);
});
