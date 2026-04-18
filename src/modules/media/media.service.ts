import 'multer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class MediaService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('S3_BUCKET_NAME') || '';
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL') || '';

    const endpoint = this.configService.get<string>('S3_ENDPOINT') || '';
    const region = this.configService.get<string>('S3_REGION') || 'auto';
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY') || '';
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY') || '';

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    try {
      const fileExt = extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const key = `uploads/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const url = this.publicUrl ? `${this.publicUrl}/${key}` : key;

      return {
        url,
        key,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to upload file: ${errorMessage}`);
    }
  }
}
