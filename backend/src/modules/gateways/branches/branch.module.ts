import { Module } from "@nestjs/common";
import { BranchController } from "./branch.controller";
import { BranchRepo } from "./repositories/branch.repository";
import { BranchService } from "./branch.service";
import { CacheService } from "../../../common/cache/cache.service";

@Module({
    controllers: [ BranchController],
    providers: [BranchService, BranchRepo, CacheService]
})

export class BranchModule { }