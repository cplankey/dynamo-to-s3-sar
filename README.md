# dynamo-to-s3
The deployed lambda will perform a Scan on a specified Amazon DynamoDB table and write the contents to an Amazon S3 Bucket. Table and bucket are parameters of this template. This can be used to create a backup of a table to restore at a later time.

Deploy to your account in the AWS Console using the [Serverless Application Repository](https://serverlessrepo.aws.amazon.com/applications/arn:aws:serverlessrepo:us-east-1:675087241163:applications~dynamodb-to-s3-importer)

### Customize the S3 Backup Output Path
If you would like to customize the path or filename of the S3 output, look for this code in the Lambda:
```
let fileName = new Date().toISOString() + '.json';
var s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(tableContents),
            ContentType: "application/json"
           };
```
and set the `fileName` variable to your desired path. Example:
```
let fileName = `backups/${process.env.TABLE_NAME}/${new Date().toISOString()}.json` 
```

### Assumptions
This assumes you already have a bucket created for the backups and a table to backup. The bucket does not need to be public, the required IAM access is granted to the Lambda for the S3 Bucket specified.


