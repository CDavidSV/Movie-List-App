import { S3Client } from "@aws-sdk/client-s3";

const bucketRegion = process.env.BUCKET_REGION as string;
const awsAccessKeyID = process.env.AWS_ACCESS_KEY_ID as string;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;

export const s3 = new S3Client({
    credentials: {
        accessKeyId: awsAccessKeyID,
        secretAccessKey: awsSecretAccessKey
    },
    region: bucketRegion
});
