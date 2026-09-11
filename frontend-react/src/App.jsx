import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";

// Componente para crear la orden
const CrearOrden = () => {
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarOrden = async () => {
    setLoading(true);
    setEstado("Enviando orden al Gateway...");

    try {
      // Apuntamos al API Gateway (Puerto 3000), NO directamente a los microservicios
      const respuesta = await fetch("http://localhost:3000/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: "Empresa de Seguridad XYZ",
          items: [{ tipo: "ABC", cantidad: 10 }],
        }),
      });

      const data = await respuesta.json();
      if (respuesta.status === 202) {
        setEstado(`✅ Éxito: ${data.mensaje} (ID: ${data.orden.idOrden})`);
      } else {
        setEstado(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setEstado("❌ Error de conexión con el API Gateway");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Sistema Distribuido - Creación de Órdenes</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <p>
          <strong>Cliente:</strong> Empresa de Seguridad XYZ
        </p>
        <p>
          <strong>Pedido:</strong> 10 Extintores tipo ABC
        </p>
        <button
          onClick={enviarOrden}
          disabled={loading}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {loading ? "Procesando..." : "Generar Orden de Pedido"}
        </button>
      </div>
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f4f4f4",
          borderRadius: "5px",
        }}
      >
        <strong>Estado de la red:</strong> {estado}
      </div>
    </div>
  );
};

function App() {
  return (
    <Switch>
      <Route path="/" component={CrearOrden} />
      <Route path="/dashboard">Ruta dinámica para ver órdenes futuras</Route>
    </Switch>
  );
}

export default App;
