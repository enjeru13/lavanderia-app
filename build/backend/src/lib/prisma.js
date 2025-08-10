"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    if (process.env.NODE_ENV === "production") {
        return new client_1.PrismaClient();
    }
    else {
        if (!global.prisma) {
            global.prisma = new client_1.PrismaClient();
        }
        return global.prisma;
    }
};
const prisma = prismaClientSingleton();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map