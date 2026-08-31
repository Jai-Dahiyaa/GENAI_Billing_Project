export interface userRegister {
    name: string,
    email: string,
    password: string
}

export interface userRegisterCache {
    name: string,
    email: string,
    hashPassword: string,
    registerOtp: string
}

export interface userRegisterTokenPayload {
    email: string,
    purpose: string
}

export interface regsiterOtpCookiePayload {
    name: string,
    value: string,
    maxAge: string
}

export interface registerOtpVerifyService {
    email: string,
    otp: string,
    ipAddress: string,
    userAgent: string,
    token: string
}

export interface getUserRegisterCache {
    email: string,
}

export interface userRegisterInDb {
    name: string,
    email: string,
    password: string
}

export interface activeBranchId {
    userId: string,
    branchId: string
}

export interface sessionPayload {
    userId: string,
    refreshToken: string,
    ipAddress: string,
    userAgent: string
}

export interface userLogin {
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
}

export interface forgotOtpPayload {
    userId: string,
    email: string,
    hashOtp: string,
    attamp: number
}

export interface forgotOtpTokenPayload {
    userId: string,
    email: string,
    purpose: string,
}

export interface forgotOtpVerify {
    otp: string,
    userId: string,
    token: string
}

export interface finalPasswordReset {
    pass1: string, 
    pass2: string, 
    token: string
}

export interface phoneNumberOtpGenerate {
    phone: string,
    userId: string,
    email: string
}

export interface phoneOtpGenerateCache {
    userId: string,
    phone: string,
    email: string,
    hashOtp: string,
    attamp: number
}

export interface phoneOtpVerifyNumberUpdate{
    otp: string,
    userId: string,
    email: string
}
