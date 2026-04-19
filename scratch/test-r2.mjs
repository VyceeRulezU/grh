import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
dotenv.config();

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function run() {
  try {
    const bucket = process.env.R2_BUCKET_NAME;
    console.log(`Listing items in bucket: ${bucket}...`);
    
    // Instead of listing ALL, search specifically for PERL
    let isTruncated = true;
    let continuationToken = undefined;
    let count = 0;
    
    while(isTruncated) {
      const res = await client.send(new ListObjectsV2Command({ 
        Bucket: bucket, 
        Prefix: 'PERL_Resources/',
        ContinuationToken: continuationToken
      }));
      
      if (res.Contents) {
        res.Contents.forEach(o => {
          if (o.Key.includes('.doc') || o.Key.includes('.png')) {
            console.log(o.Key);
          }
          count++;
        });
      }
      
      isTruncated = res.IsTruncated;
      continuationToken = res.NextContinuationToken;
      
      if (count > 50) break; // just get a sample
    }
    
    if (count === 0) {
      console.log("Found no files matching PERL_Resources/");
      
      // Try listing top 10 items in the root just to see what's there
      const res2 = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 10 }));
      console.log("\nTop 10 files in root:");
      if (res2.Contents) res2.Contents.forEach(o => console.log(o.Key));
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
