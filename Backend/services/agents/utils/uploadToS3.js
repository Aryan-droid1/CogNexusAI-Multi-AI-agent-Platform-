import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3.js"

export const uploadToS3=async (fileName,buffer,contentType)=>{

  //command for send into s3 like uploading to s3
  await s3.send(
    new PutObjectCommand({
      Bucket:process.env.AWS_BUCKET_NAME,
      Body:buffer,
      Key: fileName,
      ContentType:contentType
    })

    //for get from s3


  )
}