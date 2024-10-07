import express from "express";
import { v4 as uuidv4 } from "uuid"; // Importando o UUID
import cors from "cors"; // Importando o CORS

const app = express();
const PORT = 4000;

const pedidos = [];

// Middleware para permitir CORS
app.use(cors()); // Adicione isso para permitir CORS
app.use(express.json()); // Middleware para parsear o corpo das requisições

// Middleware para verificar se o pedido existe
const checkPedidoId = (request, response, next) => {
  const { id } = request.params;
  const index = pedidos.findIndex((pedido) => pedido.id === id); // Compara com o ID string

  if (index < 0) {
    return response.status(404).json({ message: "Pedido não encontrado" });
  }
  request.pedidoIndex = index;
  request.pedidoId = id;
  request.pedido = pedidos[index]; // Armazena o pedido encontrado

  next();
};

// Rota para obter todos os pedidos
app.get("/order", (req, res) => {
  return res.json(pedidos); // Retorna todos os pedidos
});

// Rota para obter um pedido específico
app.get("/order/:id", checkPedidoId, (req, res) => {
  return res.json(req.pedido);
});

// Rota para criar um novo pedido
app.post("/order", (req, res) => {
  const { order, clientName } = req.body; // Removido o campo price

  // Validação básica
  if (!order || !clientName) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" });
  }

  const pedido = {
    id: uuidv4(), // Gerando ID único
    order,
    clientName,
    status: "Em preparação",
  };

  pedidos.push(pedido);
  return res.status(201).json(pedido);
});

// Rota para atualizar um pedido existente
app.put("/order/:id", checkPedidoId, (request, response) => {
  const { order, clientName } = request.body; // Removido o campo price

  request.pedido.order = order || request.pedido.order; // Atualiza ou mantém o existente
  request.pedido.clientName = clientName || request.pedido.clientName; // Atualiza ou mantém o existente

  return response.json(request.pedido);
});

// Rota para deletar um pedido
app.delete("/order/:id", checkPedidoId, (req, res) => {
  pedidos.splice(req.pedidoIndex, 1); // Remove o pedido do array
  return res.status(204).send(); // Responde com No Content
});

// Rota para mudar o status de um pedido para "Pronto"
app.patch("/order/:id", checkPedidoId, (req, res) => {
  req.pedido.status = "Pronto"; // Altera o status do pedido
  return res.json(req.pedido);
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
