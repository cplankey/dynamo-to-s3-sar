
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
 * @returns {Object} object - Success or error messages
 * 
 */
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient();
exports.lambdaHandler = async (event, context) => {
    let tableContents;
    try{
        //get items from dynamo
        const params = {
            TableName: process.env.TABLE_NAME,
        };
        tableContents = await scanDB(params);
    }catch{
        console.log(err);
        return err;
    }
    try{
        //write items to s3 using timestamp
        let fileName = new Date().toISOString() + '.json';
        var s3Params = {
            Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: JSON.stringify(tableContents),
            ContentType: "application/json"
           };
           await s3.putObject(s3Params).promise();
           response = {
               statusCode: 200,
               message: `Successfully wrote contents from ${process.env.TABLE_NAME} to ${process.env.BUCKET_NAME}/${fileName}`
           };
    }catch{
        console.log(err);
        return err;
    }
    return response;
};
async function scanDB(params) {
    let dynamoContents = [];
    let items;
    do{
        items =  await docClient.scan(params).promise();
        items.Items.forEach((item) => dynamoContents.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");
    return dynamoContents;
};
