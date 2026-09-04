import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../db/prismaDB";

@Injectable()
export class WhatsAppRepo {
    constructor (
        private readonly prisma: PrismaService
    ) {}
}