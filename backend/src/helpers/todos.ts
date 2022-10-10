import { TodosAccess } from './todosAcess'
// import { uploadAttachment } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
// import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
// import * as createError from 'http-errors'

// Implement businessLogic

// const logger = createLogger('TodosBusinessLogic')

const todosAccess = new TodosAccess()

export async function saveTodo(todoItem: TodoItem) {
  return await todosAccess.persistTodo(todoItem)
}

export async function getTodos(userId: string) {
  return await todosAccess.getAllTodos(userId)
}

export async function handleUpdateTodo(
  todoId: string,
  userId: string,
  todoUpdate: UpdateTodoRequest
) {
  return await todosAccess.updateTodo(todoId, userId, todoUpdate)
}

export async function handleDeleteTodo(todoId: string, userId: string) {
  return await todosAccess.deleteTodo(todoId, userId)
}

export async function handleCreateAttachmentPresignedUrl(
  todoId: string,
  userId: string
) {
  return await todosAccess.updateAttachmentUrl( todoId, userId)
}
