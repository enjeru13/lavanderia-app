const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dayjs = require("dayjs");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let Iconv;
try {
  Iconv = require("iconv-lite");
} catch (e) {
  console.error(
    "Error: iconv-lite no está instalado. Por favor, ejecuta 'npm install iconv-lite'."
  );
  process.exit(1);
}

const PRINTNODE_API_KEY = process.env.PRINTNODE_API_KEY;
const PRINTER_ID = 74626370;

const ESC = "\x1B";
const GS = "\x1D";
const CENTRAR = `${ESC}\x61\x01`;
const ALINEAR_IZQUIERDA = `${ESC}\x61\x00`;
const NEGRITA = `${ESC}\x45\x01`;
const NORMAL = `${ESC}\x45\x00`;
const TAMAÑO_NORMAL = `${GS}\x21\x00`;
const TAMAÑO_2X = `${GS}\x21\x01`;
const PAGINA_DE_CODIGOS = `${ESC}\x74\x13`;

const LINE_WIDTH = 32;

const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

const formatearMoneda = (monto) => {
  return `$${Number(monto).toFixed(2)}`;
};

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

  const totalCantidad = items.reduce((sum, item) => sum + item.cantidad, 0);
  const porPagar = Math.max(total - abono, 0);

  const formatAlignedLine = (labelText, valueText) => {
    const spacesToPad = LINE_WIDTH - labelText.length - valueText.length;
    return `${NEGRITA}${labelText}${NORMAL}${Array(spacesToPad + 1).join(
      " "
    )}${valueText}\n`;
  };

  reciboTexto += formatAlignedLine(
    "Total Cantidad Piezas:",
    String(totalCantidad)
  );
  reciboTexto += formatAlignedLine("Total:", formatearMoneda(total));
  reciboTexto += formatAlignedLine("Total Abono:", formatearMoneda(abono));
  reciboTexto += formatAlignedLine("Por pagar:", formatearMoneda(porPagar));

  reciboTexto += `--------------------------------\n`;

  if (observaciones) {
    reciboTexto += `${NEGRITA}Observaciones:${NORMAL}\n`;
    reciboTexto += `${observaciones}\n`;
    reciboTexto += `--------------------------------\n`;
  }

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

module.exports = app;
