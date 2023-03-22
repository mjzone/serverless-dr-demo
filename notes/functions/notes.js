const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
} = require("@aws-sdk/client-dynamodb");

const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTES_TABLE = process.env.NOTES_TABLE;

// Get a note by ID
exports.getNote = async (event) => {
  console.log("getNote")
  const id = event.pathParameters.id;
  const params = {
    TableName: NOTES_TABLE,
    Key: marshall({ id }),
  };
  try {
    const data = await client.send(new GetItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(unmarshall(data.Item)),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

// Create a new note
exports.createNote = async (event) => {
  const { title, content } = JSON.parse(event.body);
  const id = Date.now().toString();
  const params = {
    TableName: NOTES_TABLE,
    Item: marshall({
      id: id,
      title: title,
      content: content,
      region: process.env.AWS_REGION
    }),
  };
  try {
    await client.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ id: id }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

// Update an existing note
exports.updateNote = async (event) => {
  const id = event.pathParameters.id;
  const { title, content } = JSON.parse(event.body);
  const params = {
    TableName: NOTES_TABLE,
    Key: marshall({ id }),
    UpdateExpression: "set #t = :t, #c = :c",
    ExpressionAttributeNames: {
      "#t": "title",
      "#c": "content",
    },
    ExpressionAttributeValues: marshall({
      ":t": title,
      ":c": content,
    }),
    ReturnValues: "UPDATED_NEW",
  };
  try {
    const data = await client.send(new UpdateItemCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(unmarshall(data.Attributes)),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};

// Delete a note
exports.deleteNote = async (event) => {
  const id = event.pathParameters.id;
  const params = {
    TableName: NOTES_TABLE,
    Key: marshall({ id }),
  };
  try {
    await client.send(new DeleteItemCommand(params));
    return {
      statusCode: 204,
      body: "",
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
