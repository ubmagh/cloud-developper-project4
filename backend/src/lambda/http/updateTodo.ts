import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // Update a TODO item with the provided id using values in the "updatedTodo" object

    const userId = getUserId(event);
    const updatedItem = await updateTodo(
      {
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: updatedTodo.done, //
        attachmentUrl: "http://example.com/image.png",
        dueDate: updatedTodo.dueDate, //
        name: updatedTodo.name //
      },
      todoId,
      userId
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: updatedItem
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
