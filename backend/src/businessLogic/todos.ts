import { getTodos, handleCreateAttachmentPresignedUrl, handleDeleteTodo, handleUpdateTodo, saveTodo } from "../helpers/todos";
import { TodoItem } from "../models/TodoItem";
import * as uuid from "uuid";



export async function getTodosForUser( userId: string) {
    return await getTodos( userId );
}

export async function createTodo( userId: string, dueDate: string, name: string ) {
  const todoItem = {
    userId: userId,
    todoId: uuid.v4(),
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    dueDate: dueDate,
    name: name        
  }
  
  return await saveTodo( todoItem ); 
}

export async function updateTodo( todoItem: TodoItem, todoId: string, userId: string) {
  return await handleUpdateTodo( todoId, userId, todoItem );
}

export async function deleteTodo( todoId: string, userId: string) {
  return await handleDeleteTodo( todoId, userId );
}


export async function createAttachmentPresignedUrl( todoId: string, userId: string) {
  return await handleCreateAttachmentPresignedUrl( todoId, userId );
}


