import { Request } from 'express';

export interface IExtendedClientInfo {
  ipAddress: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  origin: string;
  referer: string;
  host: string;
}

export const getClientInfo = (req: Request): IExtendedClientInfo => {
  const userAgent = (req.headers['user-agent'] as string) || '';
  
  const rawIp =
    (req.headers['cf-connecting-ip'] as string) ||
    (req.headers['x-real-ip'] as string) ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    req.ip ||
    '127.0.0.1';

  const ipAddress = rawIp.replace('::1', '127.0.0.1');

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  const uaLower = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(uaLower)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|android|blackberry|phone/i.test(uaLower)) {
    deviceType = 'mobile';
  }

  return {
    ipAddress,
    userAgent,
    deviceType,
    origin: (req.headers['origin'] as string) || '',
    referer: (req.headers['referer'] as string) || '',
    host: (req.headers['host'] as string) || '',
  };
};