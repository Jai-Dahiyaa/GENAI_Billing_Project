export interface BranchCreate {
    userId: string,
    companyId: string,
    branchName: string,
    city: string,
    phone: string,
    address: string,
    invoicePrefix: string
}

export interface BranchCreateRes {
    id: string,
    branchName: string,
    invoicePrefix: string,
    city?: string,
    address?: string,
    phone?: string,
    isPhoneVerified?: boolean,
    isMainBranch?: boolean,
    isActive?: boolean,
    lastInvoiceNo?: number,
    createdAt: Date
}

export interface IBranchResponse {
    id: string;
    branchName: string;
    invoicePrefix: string;
    city: string | null;
    address: string | null;
    phone: string | null;
    isPhoneVerified: boolean;
    isMainBranch: boolean;
    isActive: boolean;
    lastInvoiceNo: number;
    createdAt: Date;
}

export interface IBranchUpdate {
    userId: string,
    companyId: string,
    branchId: string,
    branchName?: string,
    city?: string,
    address?: string,
    phone?: string,
    resetPhoneVerification?: boolean;
}