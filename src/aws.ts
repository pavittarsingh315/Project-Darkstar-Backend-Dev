import aws from "aws-sdk";
import crypto from "crypto";
import { promisify } from "util";

const randomBytes = promisify(crypto.randomBytes);

const region = <string>process.env.AWS_BUCKET_REGION;
const bucketName = <string>process.env.AWS_BUCKET_NAME;
const accessKeyId = <string>process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = <string>process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
   region,
   signatureVersion: "v4",
   credentials: {
      accessKeyId,
      secretAccessKey,
   },
});

export async function generateUploadUrl() {
   try {
      const randBytes = await randomBytes(16);
      const imgName = randBytes.toString("hex");

      const params = {
         Bucket: bucketName,
         Key: `profilePics/${imgName}`, // `postPics/${imgName}` for postPics
         Expires: 60,
      };

      const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
      return uploadUrl;
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}

export async function deleteObject(imgName: string) {
   try {
      const params = {
         Bucket: bucketName,
         Key: imgName,
      };
      await s3.deleteObject(params).promise();
   } catch (e) {
      let err = <Error>e;
      throw Error(err.message);
   }
}
