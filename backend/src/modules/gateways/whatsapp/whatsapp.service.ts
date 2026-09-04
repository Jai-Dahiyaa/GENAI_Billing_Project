import { Injectable } from "@nestjs/common";
import { WhatsAppRepo } from "./repositories/whatsapp.repository";
import { OtpUtil } from "../../../utils/otp.utils";
import { CacheService } from "../../../common/cache/cache.service";
import { WhatsappUtil } from "../../../utils/whatsapp.utils";
import * as WhatsAppInterface from "../../../common/interfaces/whatsapp.interface";

@Injectable()
export class WhatsAppService {

    constructor(
        private readonly whatsAppRepo: WhatsAppRepo,
        private readonly cache: CacheService
    ) { }

    async phoneNumberVerify(userId: string, phone: string) {
        console.log("FINAL HERE IS NUMBER: ", {
            userId,
            phone
        });

        const otpGenerate = OtpUtil.generateOtp();
        const otpHash = OtpUtil.hashOtp(otpGenerate);

        const cacheSetData: WhatsAppInterface.whatsappPhoneVerifyCacheData = {
            phone,
            userId,
            hashOtp: otpHash,
            attamp: 3
        }

        await this.cache.userNumberVerify(cacheSetData);
        await WhatsappUtil.sendDirectOtp(phone, otpGenerate);

        console.log("OTP HASH AND GENERATE HERE: ", {
            otpGenerate,
            otpHash
        })
    }

    
}