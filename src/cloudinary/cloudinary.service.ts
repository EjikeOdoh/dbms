import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as fs from 'fs';


@Injectable()
export class CloudinaryService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(filePath: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                filePath,
                {
                    folder: 'partners',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                    this.deleteFile(filePath)
                },
            )
        });
    }

    async deleteImage(publicId: string) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }

    private deleteFile(filePath: string): void {
        fs.unlink(filePath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.error('File not found');
                } else {
                    console.error('Error deleting file:', err);
                }
                return;
            }
            console.log(`File at ${filePath} deleted successfully`);
        });
    }
}
