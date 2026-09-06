import { Controller, Body, Get, Post, Req, Res, HttpCode, HttpStatus, BadRequestException, Param, ParseUUIDPipe, Patch, UseGuards, UseInterceptors } from "@nestjs/common";
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { BranchService } from "./branch.service";
import { Public } from "../../../common/decorators/public.decorator";
import * as BranchDto from "./dto/branch.dto"
import * as BranchInterface from "../../../common/interfaces/branch.interface"
import { IAuthorizedRequest } from "../../../common/interfaces/request.interface";
import { Roles } from "../../../common/decorators/role.decorator";
import { RolesGuard } from "../../../common/guards/role.guard";

@Controller('branch')
export class BranchController {
    constructor(
        private readonly service: BranchService
    ) { }

    @Public()
    @Get('health')
    @HttpCode(HttpStatus.OK)
    async companyApiHealth() {
        return {
            success: true,
            message: "Branch APIs is ready",
            version: "1.0.0",
            status: "Stable",
        }
    }

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    async branchCreate(
        @Body() body: BranchDto.BranchCreate,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, data: BranchInterface.BranchCreateRes }> {

        const { userId, companyId } = req.user;
        const { branchName, city, address, phone, invoicePrefix } = body;

        if (!companyId) {
            throw new BadRequestException("Please First Create Your Company.")
        }

        const data: BranchInterface.BranchCreate = {
            userId,
            companyId,
            branchName,
            city,
            phone,
            address,
            invoicePrefix
        }

        const newBranch = await this.service.branchCreate(data)

        return {
            status: true,
            message: "Your Branch SuccessFully Create.",
            data: newBranch
        }
    }

    @Get('list')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    async branchListGet(
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, data: BranchInterface.IBranchResponse[] }> {

        const { companyId } = req.user;

        if (!companyId) {
            throw new BadRequestException("Please First Create Your Company.")
        }

        const result = await this.service.branchListGet(companyId)

        return {
            status: true,
            message: 'Your All Branch SuccessFully Get.',
            data: result
        }
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN', 'BRANCH_HEAD')
    async branchDataGet(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, data: BranchInterface.IBranchResponse }> {
        const { companyId } = req.user;

        if (!companyId) {
            throw new BadRequestException("Please First Create Your Company.")
        }

        const result = await this.service.branchDataGet(companyId, id)

        return {
            status: true,
            message: "Branch Data SuccessFully Fetch.",
            data: result
        }
    }

    @Patch('main-set/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    async mainBranchSet(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {
        const { companyId } = req.user;

        if (!companyId) {
            throw new BadRequestException("Please First Create Your Company.")
        }

        await this.service.mainBranchSet(companyId, id);

        return {
            status: true,
            message: "Your Branch Update SuccessFully",
        }
    }

    @Post('select-active/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    async branchActiveSet(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string }> {
        const { userId, companyId } = req.user;

        await this.service.setActiveBranchContext(userId, companyId, id);

        return {
            status: true,
            message: "This Branch is Active Now."
        }
    }

    @Patch('update')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN', 'BRANCH_HEAD')
    @UseInterceptors(NoFilesInterceptor())
    async branchUpdate(
        @Body() body: BranchDto.BranchUpdate,
        @Req() req: IAuthorizedRequest
    ): Promise<{ status: boolean, message: string, data: BranchInterface.IBranchResponse | null }> {
        const { userId, branchId, companyId } = req.user;
        const { branchName, city, address, phone } = body;

        const data: BranchInterface.IBranchUpdate = {
            userId,
            companyId,
            branchId,
            branchName,
            city,
            address,
            phone
        }

        const result = await this.service.branchUpdate(data)

        return {
            status: true,
            message: "Your Branch Detail Update SuccessFully",
            data: result
        }
    }

    @Patch('toggle-status/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RolesGuard)
    @Roles('SUPER_ADMIN')
    async toggleBranchStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Req() req: IAuthorizedRequest
    ) {
        const { companyId } = req.user;

        if (!companyId) {
            throw new BadRequestException("Company context missing.");
        }

        const updatedBranch = await this.service.toggleBranchStatus(companyId, id);

        return {
            status: true,
            message: `Branch successfully marked as ${updatedBranch.isActive ? 'Active' : 'Inactive'}.`,
            data: updatedBranch,
        };
    }
}