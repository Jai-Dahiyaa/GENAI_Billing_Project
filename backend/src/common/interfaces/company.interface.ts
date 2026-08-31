export interface CompanyProfileCreate {
    userId: string,
    email: string,
    role: string,
    branchId: string,
    businessName: string,
    address: string,
    ipAddress: string,
    userAgent: string,
    phone: string,
    isPhoneVerified?: string,
    gstin?: string,
    bankName?: string,
    accountNumber?: string,
    ifscCode?: string,
    upiId?: string,
    logo?: Express.Multer.File,
    logoUrl?: string | null;
}

export interface CreateCompanyResponse {
    dbInsert: object,
    accessToken: string,
    refreshToken: string
}

export interface CompanyProfileResponse {
    id: string,
    businessName: string;
    logoUrl: string | null;
    phone: string;
    isPhoneVerified?: boolean;
    address: string;
    gstin: string | null;
    bankName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    upiId: string | null;
}

export interface CompanyProfileUpdate {
    userId: string,
    businessName?: string,
    address?: string,
    gstin?: string,
    bankName?: string,
    accountNumber?: string,
    ifscCode?: string,
    upiId?: string,
    logo?: Express.Multer.File,
    logoUrl?: string | null;
}