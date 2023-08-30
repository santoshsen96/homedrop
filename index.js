const aws = require("aws-sdk");
const fs = require("fs");
const nodemailer = require("nodemailer");
const dynamoDBTableName = 'thirdTable';
const dynamodb = new aws.DynamoDB.DocumentClient();
const sendPath = '/send-report'
const getPath="/get-history"

exports.handler = async (event) => {
    let response;
    switch (event.httpMethod) {
        case "POST":
            if (event.resource === sendPath) {
                const { senderEmail, senderName, phone } = JSON.parse(event.body);
    
            
                let transporter = nodemailer.createTransport({
                    SES: new aws.SES({ region: "ap-southeast-2", apiVersion: "2010-12-01" }),
                });

                let emailProps = await transporter.sendMail({
                    from: senderName,
                    to: senderEmail,
                    subject: new Date().toString(),
                    text: "hi",
                    html: "<div>" + "Hello from Santosh!!" + "</div>",
                    
                });

                response = await saveReport({senderEmail,senderName,phone});
                  console.log("Response:", JSON.stringify(response));
           // return response;
               // return emailProps;
            }
            break; // Add a break here to exit the case
        case "GET":
            if(event.resource===getPath){
                response=await getHistory();
              break;
            }
        default:
            response = buildResponse(404, "404 not found");
    }

    return response;
};
async function getHistory(){
  const params={
    TableName:dynamoDBTableName
  }
  const allHistory=await dynamodb.scan(params).promise();
  const body={
    history:allHistory
  }
  return buildResponse(200,body)
}


async function saveReport(requestBody) {
    let id=Math.random().toString()
    const params = {
        TableName: dynamoDBTableName,
        Item:{id:id, ...requestBody}
    };

    try {
        await dynamodb.put(params).promise();
        const body = {
            operation: 'SAVE',
            message: 'Email sent to verified account',
            item: params.Item
        };
        return buildResponse(200, body);
    } catch (err) {
        
         console.error("DynamoDB Error:", err);
        return buildResponse(500, "internal server error");
        
    }
}



function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}