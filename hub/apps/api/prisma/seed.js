"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const seedUsers = [
        { email: "admin@gamer.net.ar", displayName: "Admin GamER", role: client_1.Role.ADMIN, password: "admin1234" },
        { email: "editor@gamer.net.ar", displayName: "Editor GamER", role: client_1.Role.EDITOR, password: "editor1234" },
        { email: "miembro@gamer.net.ar", displayName: "Miembro GamER", role: client_1.Role.MEMBER, password: "miembro1234" },
    ];
    for (const u of seedUsers) {
        const passwordHash = await bcrypt.hash(u.password, 12);
        await prisma.user.upsert({
            where: { email: u.email },
            update: { role: u.role, displayName: u.displayName },
            create: { email: u.email, displayName: u.displayName, role: u.role, passwordHash },
        });
        // eslint-disable-next-line no-console
        console.log(`seeded ${u.role}: ${u.email} / ${u.password}`);
    }
}
main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
