import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { AttachmentUtils } from './attachmentUtils'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private docClient: DocumentClient = createDynamoDBClient(),
    private attachementCtrl : AttachmentUtils = new AttachmentUtils(),
    private todosTable = process.env.TODOS_TABLE
  ) {}

  async persistTodo(todoItem: TodoItem) {
    logger.info('Creating a new todo item : ', todoItem)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()
    return todoItem;
  }

  async getAllTodos(userId: string) {
    logger.info('Getting all todos for user : ', userId)
    const res = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()
    return res.Items as TodoItem[]
  }

  async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate) {
    logger.info('Updating todo item : ', { todoId, userId })
    return await this.docClient
      .update(
        {
          TableName: this.todosTable,
          Key: { userId, todoId },
          ExpressionAttributeNames: { '#N': 'name' },
          UpdateExpression: 'set #N=:todoName, dueDate=:dueDate, done=:done',
          ExpressionAttributeValues: {
            ':todoName': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done
          },
          ReturnValues: 'UPDATED_NEW'
        },
        function (err, data) {
          if (err) {
            const error = JSON.stringify(err, null, 2)
            logger.error('=> Unable to update item. Error JSON:', error)
          } else {
            const updatedItem = JSON.stringify(data, null, 2)
            logger.info('=> Successfully updated todo:', updatedItem)
          }
        }
      )
      .promise()
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info('Deleting todo item : ', { todoId, userId })
    return await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
      .promise()
  }

  async updateAttachmentUrl(
    todoId: string,
    userId: string
  ) {
    const UploadUrl = await this.attachementCtrl.getUploadUrl(todoId);
    const attachementUrl = await this.attachementCtrl.getAttachmentUrl(todoId);
    await this.docClient
      .update(
        {
          TableName: this.todosTable,
          Key: { userId, todoId },
          UpdateExpression: 'set attachmentUrl=:attachmentUrl',
          ExpressionAttributeValues: {
            ':attachmentUrl': attachementUrl
          },
          ReturnValues: 'UPDATED_NEW'
        },
        function (err, data) {
          if (err) {
            const error = JSON.stringify(err, null, 2)
            logger.error('=> Unable to update item. Error JSON:', error)
          } else {
            const updatedItem = JSON.stringify(data, null, 2)
            logger.info('=> Successfully updated todo:', updatedItem)
          }
        }
      )
      .promise()
      return UploadUrl;
  }
}


function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}