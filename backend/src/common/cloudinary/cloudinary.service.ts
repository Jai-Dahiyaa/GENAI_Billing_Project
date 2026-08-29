import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import 'multer';

@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: Express.Multer.File,
        folder: string = 'companies',
    ): Promise<UploadApiResponse> {
        if (!file || !file.buffer) {
            throw new BadRequestException('Invalid file upload. Buffer is empty.');
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `billing_pos/${folder}`,
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' }
                    ],
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) {
                        return reject(new InternalServerErrorException(error.message || 'Cloudinary upload failed'));
                    }
                    if (!result) {
                        return reject(new InternalServerErrorException('Cloudinary upload response is empty'));
                    }
                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async deleteImage(publicId: string): Promise<any> {
        try {
            return await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete image from Cloudinary');
        }
    }
}