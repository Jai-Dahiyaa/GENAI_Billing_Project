import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { CacheService } from "../../../common/cache/cache.service";
import { BranchRepo } from "./repositories/branch.repository";
import * as BranchInterface from "../../../common/interfaces/branch.interface"

@Injectable()
export class BranchService {
    constructor(
        private readonly cache: CacheService,
        private readonly repo: BranchRepo
    ) { }

    async branchCreate(data: BranchInterface.BranchCreate): Promise<BranchInterface.BranchCreateRes> {
        const dbResponse = await this.repo.branchCreate(data);

        if (!dbResponse) {
            throw new BadRequestException("Something is Wrong Please try again After someTime.")
        }

        if (dbResponse.isMainBranch) {
            await this.cache.setActiveBranchId({
                userId: data.userId,
                branchId: dbResponse.id,
            });
        }

        await this.cache.branchDataStore(data.companyId, dbResponse)

        return dbResponse;
    }

    async branchListGet(companyId: string): Promise<BranchInterface.IBranchResponse[]> {
        const dbResponse = await this.repo.branchListGet(companyId)
        const key = `branchList:${companyId}`;
        const cacheGetData = await this.cache.get(key);
        const originalForm = JSON.parse(cacheGetData);

        if (originalForm) {
            return originalForm
        }

        if (!dbResponse) {
            throw new BadRequestException("List Not Fetch SomeThing is Problem.")
        }

        await this.cache.branchListStore(companyId, dbResponse);

        return dbResponse;
    }

    async branchDataGet(companyId: string, branchId: string): Promise<BranchInterface.IBranchResponse> {

        const key = `branch:${companyId}:${branchId}`;
        const cacheDataGet = await this.cache.get(key);
        const originalForm = JSON.parse(cacheDataGet);

        if (originalForm) {
            return originalForm;
        }

        const dbResponse = await this.repo.branchDataGet(companyId, branchId);

        if (!dbResponse) {
            throw new NotFoundException("This Branch Data Not Found.")
        }

        await this.cache.branchDataStore(companyId, dbResponse);

        return dbResponse;
    }

    async mainBranchSet(companyId: string, branchId: string): Promise<void> {

        const dbResponse = await this.repo.branchDataGet(companyId, branchId);

        if (!dbResponse) {
            throw new NotFoundException("Branch not found in your company.");
        }

        if (dbResponse.isMainBranch === true) {
            throw new BadRequestException("This branch is already designated as the main branch.")
        }

        const dbMainSet = await this.repo.mainBranchSet(companyId, branchId);

        const listKey = `branchList:${companyId}`;
        const branchKey = `branch:${companyId}:${branchId}`;
        const oldMainbranchKey = `branch:${companyId}:${dbMainSet}`;

        await this.cache.del(listKey);
        await this.cache.del(branchKey);
        await this.cache.del(oldMainbranchKey);
    }

    async setActiveBranchContext(userId: string, companyId: string, branchId: string): Promise<void> {

        const branch = await this.repo.branchDataGet(companyId, branchId);

        if (!branch) {
            throw new NotFoundException("Branch not found in your company.");
        }

        await this.cache.setActiveBranchId({ userId, branchId });
    }

    async branchUpdate(data: BranchInterface.IBranchUpdate): Promise<BranchInterface.IBranchResponse | null> {

        const key = `superadmin:active_branch:${data.userId}`;
        const branchId = await this.cache.getActiveBranchId(key);

        if (!branchId) {
            throw new BadRequestException("Please select an active branch first to perform this action.");
        }

        if (!branchId) {
            throw new BadRequestException("Please select an active branch first to perform this action.");
        }

        const updatedBranch = await this.repo.updateBranchProfile(data);

        if (!updatedBranch) {
            throw new NotFoundException("Branch not found or update failed.");
        }

        await this.cache.branchDataStore(data.companyId, updatedBranch);

        return updatedBranch;
    }

    async toggleBranchStatus(companyId: string, branchId: string): Promise<BranchInterface.IBranchResponse> {

        const branch = await this.repo.branchDataGet(companyId, branchId);

        if (!branch) {
            throw new NotFoundException("Branch not found in your company.");
        }

        if (branch.isMainBranch && branch.isActive) {
            throw new BadRequestException("Main branch cannot be deactivated. Please designate another branch as main first.");
        }

        const updatedBranch = await this.repo.toggleBranchStatus(companyId, branchId);

        if (!updatedBranch) {
            throw new InternalServerErrorException("Failed to update branch status.");
        }

        await this.cache.del(`branchList:${companyId}`);
        await this.cache.del(`branch:${companyId}:${branchId}`);

        return updatedBranch;
    }
}