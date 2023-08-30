const AWS=require('aws-sdk');


AWS.config.update({
  region:"ap-southeast-2"
});


const dynamoDBTableName2="secondTable"
const dynamodb = new AWS.DynamoDB.DocumentClient();

const userPath2="/auth"

exports.handler = async (event) => {
  // TODO implement
  let response;
  switch(event.httpMethod){
    case "POST":
       if (event.resource === userPath2) { // Check the resource path
        response = await saveUser2(JSON.parse(event.body));
      } 
      break;
    
    default:
      response=buildResponse(404,"404 not found");
  }
  
  return response;
  
};




async function saveUser2(requestBody){
  const params={
    TableName: dynamoDBTableName2,
    Item:requestBody
  }
  return await dynamodb.put(params).promise().then(()=>{
    const body={
      operation:'SAVE',
      message:'SUCCESS',
      item:requestBody,
      token:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }
    return buildResponse(200,body)
  },(err)=>{
    console.log(err)
  })
}

function buildResponse(statusCode,body){
  return{
    statusCode:statusCode,
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify(body)
  };
}