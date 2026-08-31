import { Request } from 'express';

export interface IUserPayload {
  userId: string;
  email: string;
  role: string;
  branchId?: string;
  companyId: string
}

export interface IAuthorizedRequest extends Request {
  user: IUserPayload;
}