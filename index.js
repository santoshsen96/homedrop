const aws = require("aws-sdk");
const fs = require("fs");
const nodemailer = require("nodemailer");
const dynamoDBTableName = "thirdTable";
const dynamoDBTableName2 = "secondTable";

const dynamodb2 = new aws.DynamoDB.DocumentClient();

const dynamodb = new aws.DynamoDB();
const sendPath = "/send-report";
const getPath = "/get-history";

exports.handler = async (event) => {
  let response;
  switch (event.httpMethod) {
    case "POST":
      if (event.resource === sendPath) {
        const { senderEmail, senderName, message, base64Data, date } =
          JSON.parse(event.body);

        const base64RemoveDataURI = base64Data.replace(
          "data:application/pdf;base64,",
          ""
        );

        let transporter = nodemailer.createTransport({
          SES: new aws.SES({
            region: "ap-southeast-2",
            apiVersion: "2010-12-01",
          }),
        });

        let emailProps = await transporter.sendMail({
          from: senderName,
          to: senderEmail,
          subject: date,
          text: message,
          html: "<div>" + message + "</div>",
          attachments: [
            {
              filename: "TEST_FILE_NAME.pdf",
              content: base64RemoveDataURI,
              encoding: "base64",
            },
          ],
        });

        response = await saveReport({ senderEmail, senderName, date, message });
        console.log("Response:", JSON.stringify(response));
      }

      break; // Add a break here to exit the case
    case "GET":
      if (event.resource === getPath) {
        const token2 = event.headers.Authorization;
        const email = await getEmailByToken(token2);

        if (email) {
          response = await getHistory(email);
        } else {
          response = buildResponse(400, "missing token");
        }
      }
      break;
    default:
      response = buildResponse(404, "404 not found");
  }

  return response;
};

async function getHistory(emailToFilter) {
  const params = {
    TableName: dynamoDBTableName, // Replace with your table name
    FilterExpression: "senderEmail = :senderEmail", // Specify the email attribute and filter value
    ExpressionAttributeValues: {
      ":senderEmail": { S: emailToFilter }, // Replace with the email address you want to filter by
    },
  };

  try {
    const filteredHistory = await dynamodb.scan(params).promise();
    const body = {
      history: filteredHistory.Items,
    };

    return buildResponse(200, body.history);
  } catch (err) {
    console.error("Error:", err);
    return buildResponse(500, err);
  }
}

async function getEmailByToken(tokenn) {
  const params = {
    TableName: dynamoDBTableName2, // Replace with your table name
    FilterExpression: "tok = :tok", // Filter based on the "token" attribute
    ExpressionAttributeValues: {
      ":tok": { S: tokenn }, // Replace with the token you want to search for
    },
    ProjectionExpression: "email", // Specify the attribute you want to retrieve (email)
  };

  try {
    const data = await dynamodb.scan(params).promise();
    if (data.Items.length === 0) {
      return null; // Token not found, return null or handle as needed
    }

    const item = data.Items[0];
    return item.email.S; // Return the email attribute
  } catch (err) {
    console.error("Error:", err);
    throw err; // Rethrow the error for handling in the calling code
  }
}

async function saveReport(requestBody) {
  let id = Math.random().toString();
  const params = {
    TableName: dynamoDBTableName,
    Item: { id: id, ...requestBody },
  };

  try {
    await dynamodb2.put(params).promise();
    const body = {
      operation: "SAVE",
      message: "Email sent to verified account",
      item: params.Item,
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
}
