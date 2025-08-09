const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();
require("dotenv").config();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let Iconv;
try {
  Iconv = require("iconv-lite");
} catch (e) {
  process.exit(1);
}

const PRINTNODE_API_KEY = process.env.PRINTNODE_API_KEY;
const PRINTER_ID = 74615502;

// --- Comandos ESC/POS ---
const ESC = "\x1B";
const GS = "\x1D";
const CENTRAR = `${ESC}\x61\x01`;
const ALINEAR_IZQUIERDA = `${ESC}\x61\x00`;
const NEGRITA = `${ESC}\x45\x01`;
const NORMAL = `${ESC}\x45\x00`;
const TAMAÑO_NORMAL = `${GS}\x21\x00`;
const TAMAÑO_2X = `${GS}\x21\x01`;
const PAGINA_DE_CODIGOS = `${ESC}\x74\x13`;

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
};

const formatearMoneda = (monto) => {
  return `$${monto.toFixed(2)}`;
};

// --- Lógica de generación del recibo ---
const generateReceiptText = (datosRecibo) => {
  let reciboTexto = "";
  const {
    clienteInfo,
    items,
    abono,
    total,
    lavanderiaInfo,
    numeroOrden,
    observaciones,
    mensajePieRecibo,
  } = datosRecibo;

  // Encabezado
  reciboTexto += CENTRAR;
  reciboTexto += TAMAÑO_2X;
  reciboTexto += `${NEGRITA}${lavanderiaInfo.nombre}${NORMAL}\n\n`;
  reciboTexto += TAMAÑO_NORMAL;
  if (lavanderiaInfo.rif) reciboTexto += `RIF: ${lavanderiaInfo.rif}\n`;
  if (lavanderiaInfo.direccion) reciboTexto += `${lavanderiaInfo.direccion}\n`;
  if (lavanderiaInfo.telefonoPrincipal) {
    reciboTexto += `Whatsapp: ${lavanderiaInfo.telefonoPrincipal}\n`;
  }
  if (lavanderiaInfo.telefonoSecundario) {
    reciboTexto += `CANTV: ${lavanderiaInfo.telefonoSecundario}\n`;
  }

  if (numeroOrden)
    reciboTexto += `${NEGRITA}N° Orden: ${NORMAL}#${numeroOrden}\n`;
  reciboTexto += `${ALINEAR_IZQUIERDA}--------------------------------\n`;

  // Datos del cliente
  reciboTexto += `${NEGRITA}Cliente: ${NORMAL}${clienteInfo.nombre} ${clienteInfo.apellido}\n`;
  reciboTexto += `${NEGRITA}CI/RIF: ${NORMAL}${clienteInfo.identificacion}\n`;
  reciboTexto += `${NEGRITA}Fecha de Ingreso:${NORMAL} ${formatDate(
    clienteInfo.fechaIngreso
  )}\n`;
  if (clienteInfo.fechaEntrega) {
    reciboTexto += `${NEGRITA}Fecha de Entrega:${NORMAL} ${formatDate(
      clienteInfo.fechaEntrega
    )}\n`;
  }
  reciboTexto += `--------------------------------\n`;

  // Ítems con formato de tabla
  reciboTexto += `${"ITEM".padEnd(16)}${"CANT".padStart(6)}${"TOTAL".padStart(
    10
  )}\n`;
  reciboTexto += `--------------------------------\n`;

  items.forEach((item) => {
    const itemDescripcion = item.descripcion.slice(0, 16).padEnd(16);
    const itemCantidad = String(item.cantidad).padStart(6);
    const itemTotal = formatearMoneda(
      item.cantidad * item.precioUnitario
    ).padStart(10);
    reciboTexto += `${itemDescripcion}${itemCantidad}${itemTotal}\n`;
  });
  reciboTexto += `--------------------------------\n`;

  // Totales
  reciboTexto += `${NEGRITA}Total:${NORMAL} ${formatearMoneda(total).padStart(
    25
  )}\n`;
  reciboTexto += `${NEGRITA}Total Abono:${NORMAL} ${formatearMoneda(
    abono
  ).padStart(19)}\n`;
  reciboTexto += `${NEGRITA}Por pagar:${NORMAL} ${formatearMoneda(
    Math.max(total - abono, 0)
  ).padStart(21)}\n`;
  reciboTexto += `--------------------------------\n`;

  // Observaciones
  if (observaciones) {
    reciboTexto += `${NEGRITA}Observaciones:${NORMAL}\n`;
    reciboTexto += `${observaciones}\n`;
    reciboTexto += `--------------------------------\n`;
  }

  // Pie de página
  reciboTexto += CENTRAR;
  reciboTexto += `¡Gracias por preferirnos!\n`;
  reciboTexto += ALINEAR_IZQUIERDA;
  if (mensajePieRecibo) {
    reciboTexto += `${mensajePieRecibo}\n\n`;
  } else {
    reciboTexto += `* Este comprobante no da derecho a reclamo sin ticket\n`;
  }
  reciboTexto += CENTRAR;
  reciboTexto += `(NO DA DERECHO A CREDITO FISCAL)\n`;
  reciboTexto += "\n\n\n\n\n";

  return reciboTexto;
};

// --- API endpoint ---
app.post("/imprimir-recibo", async (req, res) => {
  const datosRecibo = req.body;
  let reciboTexto = PAGINA_DE_CODIGOS;
  reciboTexto += generateReceiptText(datosRecibo);

  const encodedText = Iconv.encode(reciboTexto, "CP858");
  const contentBase64 = encodedText.toString("base64");

  const requestData = {
    printer: PRINTER_ID,
    title: "Recibo de Lavandería",
    contentType: "raw_base64",
    content: contentBase64,
  };

  try {
    const response = await axios.post(
      "https://api.printnode.com/printjobs",
      requestData,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(PRINTNODE_API_KEY + ":").toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 201) {
      console.log("Trabajo de impresión enviado a PrintNode con éxito.");
      res.status(200).json({ message: "Comando de impresión enviado." });
    } else {
      console.error("Error al enviar el trabajo a PrintNode:", response.data);
      res.status(500).json({
        message: "Error en la impresión. Revisa el servicio de PrintNode.",
      });
    }
  } catch (e) {
    console.error(
      "Error de conexión con PrintNode:",
      e.response?.data || e.message
    );
    res
      .status(500)
      .json({ message: "Error de conexión con el servicio de impresión." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de impresión activo en http://localhost:${PORT}`);
});
