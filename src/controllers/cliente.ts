import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllClientes(req: Request, res: Response) {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
}

export async function getClienteById(req: Request, res: Response) {
  const { id } = req.params;
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(id) },
  });
  res.json(cliente);
}

export async function createCliente(req: Request, res: Response) {
  const data = req.body;
  const cliente = await prisma.cliente.create({ data });
  res.status(201).json(cliente);
}

export async function updateCliente(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;
  const cliente = await prisma.cliente.update({
    where: { id: Number(id) },
    data,
  });
  res.json(cliente);
}

export async function deleteCliente(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.cliente.delete({ where: { id: Number(id) } });
  res.status(204).send();
}
