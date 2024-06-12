require('dotenv').config({ path: '../.env' });
import { S3Client, S3ClientConfig, GetObjectCommand, PutObjectCommandInput, GetObjectCommandInput, PutObjectCommand } from '@aws-sdk/client-s3';
import ErrorHandler from './errorHandler';
import { aws_config_params } from '../config/aws-config';

export const s3ClientConfig: S3ClientConfig = aws_config_params;

export const s3Client = new S3Client(s3ClientConfig);

const getParams = (folderName: string, imageName: string): GetObjectCommandInput => ({
  Bucket: process.env.AWS_S3_BUCKET_NAME as string,
  Key: `${folderName}/${imageName}`,
});

export const putParams = (imageName: string, folderName: string, fileBuffer: Buffer, contentType: string): PutObjectCommandInput => ({
  Bucket: process.env.AWS_S3_BUCKET_NAME as string,
  Key: `${folderName}/${imageName}`,
  Body: fileBuffer,
  ContentType: contentType,
});

export async function getObjectURL(folderName: string, imageName: string) {
  try {
    const command = new GetObjectCommand(getParams(folderName, imageName));

    // Execute the command and get the object URL
    const response = await s3Client.send(command);
    if (response.$metadata.httpStatusCode === 200) {
      let fileUrl: string = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folderName}/${imageName}`;

      return fileUrl;
    } else {
      console.error('Error fetching object:', response.$metadata.httpStatusCode);
      return undefined;
    }
  } catch (error) {
    return new ErrorHandler(`${error}`, 500);
  }
}

export async function singleFileUpload(folderName: string, file: Express.Multer.File) {
  let fileName = file.originalname.trim().replace(/\s+/g, '-').toLowerCase();

  const putParamsConfig = putParams(fileName, folderName, file.buffer, file.mimetype);
  await s3Client.send(new PutObjectCommand(putParamsConfig));

  let objectUrl = await getObjectURL(folderName, fileName);

  return objectUrl;
}

export async function multiFileUpload(folderName: string, files: Express.Multer.File[]) {
  const uploadedFileUrls: string[] = [];
  for (const file of files) {
    let fileName = file.originalname.trim().replace(/\s+/g, '-').toLowerCase();

    const putParamsConfig = putParams(fileName, folderName, file.buffer, file.mimetype);
    await s3Client.send(new PutObjectCommand(putParamsConfig));

    let objectUrl = await getObjectURL(folderName, fileName);
    if (typeof objectUrl === 'string') {
      uploadedFileUrls.push(objectUrl);
    }
  }

  return uploadedFileUrls;
}
