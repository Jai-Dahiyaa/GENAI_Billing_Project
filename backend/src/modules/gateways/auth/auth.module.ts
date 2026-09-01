import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthRepository } from "./repositories/auth.repository";
import { CacheService } from "../../../common/cache/cache.service";
import { EmailJobs } from "../../../jobs/email.jobs";
import { JwtService } from "../../../utils/jwt.utils";

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthRepository, CacheService, EmailJobs, JwtService]
})

export class AuthModules { };