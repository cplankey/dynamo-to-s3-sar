
let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - Doesn't matter what it is, as long as its JSON
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - Success or failure messages and status codes
 * 
 */
const AWS = require('aws-sdk');
var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();
var dynamoContents = [];
var params = {
    TableName: process.env.TABLE_NAME
};
exports.lambdaHandler = async (event, context) => {
    try{
        //get items from dynamo
        docClient.scan(params, dynamoCallback);
    }catch{
        console.log(err);
        return err;
    }
    try{
        //write items to s3
        var params = {
            Body: new Buffer(dynamoContents, 'binary'),
            Bucket: process.env.BUCKET_NAME,
            Key: new Date().toISOString() + '.json',
           };
           s3.putObject(params, function(err, data) {
             if (err) throw err; // an error occurred
             else     {
                 console.log(data);         // successful response
                 response = {
                    'statusCode': 200,
                    'body': JSON.stringify({
                        message: 'Backup and Upload Successful',
                    })
                }
             }
           });
    }catch{
        console.log(err);
        return err;
    }

    return response
};

function dynamoCallback(err, data) {
    if (err) {
        console.error("Unable to scan:: ", JSON.stringify(err));
    } else {
        console.log("Scanned");
        data.Items.forEach(function(item) {
           console.log("Item : ",JSON.stringify(item));
           dynamoContents.push(item);
        });
        // continue scanning if more keys
        if (typeof data.LastEvaluatedKey != "undefined") {
            console.log("More items to scan");
            params.ExclusiveStartKey = data.LastEvaluatedKey;
            docClient.scan(params, dynamoCallback);
        }
    }
}