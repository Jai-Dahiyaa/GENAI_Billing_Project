import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class WebhookVerifyQueryDto {
  @IsString()
  @IsNotEmpty()
  'hub.mode': string;

  @IsString()
  @IsNotEmpty()
  'hub.verify_token': string;

  @IsString()
  @IsNotEmpty()
  'hub.challenge': string;
}

export class NumberVerify {
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    phone: 'Number is required!'
}