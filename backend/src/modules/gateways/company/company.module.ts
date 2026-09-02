import { Module } from "@nestjs/common";
import { CompanyController } from "./company.controller";
import { CompanyService } from "./company.service";
import { CompanyRepo } from "./repositories/company.repository";
import { CacheService } from "../../../common/cache/cache.service";
import { CloudinaryModule } from "../../../common/cloudinary/cloudinary.module";
import { JwtService } from "../../../utils/jwt.utils";
import { AuthRepository } from "../auth/repositories/auth.repository";

@Module({
    imports: [CloudinaryModule],
    controllers: [CompanyController],
    providers: [CompanyService, CompanyRepo, CacheService, JwtService, AuthRepository]
})

export class CompanyModule { }