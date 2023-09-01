const AWS=require('aws-sdk');


AWS.config.update({
  region:"ap-southeast-2"
});


const dynamoDBTableName="secondTable"
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userPath="/auth"


//const tok=generateDynamicToken(25)

exports.handler = async (event) => {
  let response;
  switch(event.httpMethod){
    case "POST":
       if (event.resource === userPath) { // Check the resource path
        response = await saveUser(JSON.parse(event.body));
      }
      break;
    default:
      response=buildResponse(404,"404 not found");
  }
  
  return response;
  
};



async function saveUser(requestBody){
 // token=requestBody.token
 const tok=generateDynamicToken(26)
  const params={
    TableName: dynamoDBTableName,
    Item:{tok,...requestBody}
    
  }
  return await dynamodb.put(params).promise().then(()=>{
    const body={
      operation:'SAVE',
      message:'SUCCESS',
      item:requestBody,
      tok:tok
    }
    return buildResponse(200,body)
  },(err)=>{
    console.log(err)
  })
}
function generateDynamicToken(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let token = "";
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        token += charset.charAt(randomIndex);
    }
    
    return token;
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