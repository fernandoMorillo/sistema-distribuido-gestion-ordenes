const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();
const PORT = 3000;

// 1. Activamos CORS para permitir peticiones del Frontend
app.use(cors());

// 2. Patrón Proxy: Sintaxis correcta para http-proxy-middleware v3+
// La ruta va en el app.use(), y la configuración va limpia en el proxy
app.use(
  "/api/ordenes",
  createProxyMiddleware({
    target: "http://127.0.0.1:3001",
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // req.originalUrl mantiene la ruta completa intacta para el destino
      console.log(
        `[Proxy] Enrutando petición a Órdenes: ${req.method} ${req.originalUrl}`,
      );
    },
  }),
);

// Proxy para el inventario
app.use(
  "/api/inventario",
  createProxyMiddleware({
    target: "http://127.0.0.1:3002",
    changeOrigin: true,
  }),
);

// Manejo de errores si un nodo interno está caído
app.use((err, req, res, next) => {
  console.error("[Gateway Error]", err.message);
  res
    .status(502)
    .json({ error: "Bad Gateway: El microservicio destino no responde." });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway (Proxy) escuchando en el puerto ${PORT}`);
});
