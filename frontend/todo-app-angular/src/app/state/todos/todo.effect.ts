import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TodosActions, TodosApiActions } from './todo.actions';
import { of, from } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TodoService } from '../../services/todo.service';
import { AppState } from '../app-state';
import { selectNewTodo } from './todo.selectors';


@Injectable()
export class TodoEffects {
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private todoService: TodoService
  ) {}

  // Define an effect in NgRx that handles the loadTodoList action dispatched by the app. 
  // When this action is dispatched, the effect calls the getTodos method of the todoService to load the list of to-do items from an external data source.
  // The createEffect function is called with an arrow function that returns an observable. 
  // This observable is the effect that will be executed in response to the loadTodoList action.
  loadTodos$ = createEffect(() =>
    this.actions$.pipe(
      // The ofType operator is used to filter out any actions that are not loadTodoList actions. 
      ofType(TodosApiActions.loadTodoList),
      // The switchMap operator is used to map the loadTodoList action to the getTodos method of the todoService. The result of this method is an observable that emits an array of to-do items.
      switchMap(() => 
        // The map operator is used to transform the array of to-do items emitted by the getTodos method into a new loadTodoListSuccess action that contains the to-do items.
        from(this.todoService.getTodos())
            .pipe(
              // Take the returned value and return a new success action containing the todos
              map((todos) => TodosApiActions.loadTodoListSuccess({ todos: todos })),
              // The catchError operator is used to catch any errors that occur while executing the getTodos method. If an error occurs, a new loadTodoListFailure action is dispatched containing the error message.
              catchError((error: string) => of(TodosApiActions.loadTodoListFailure({ error })))
            )
      )
    )
  );

  addTodos$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TodosActions.addTodo),
        withLatestFrom(this.store.select(selectNewTodo)),
        switchMap(([action, todo]) => {
          return from(this.todoService.addTodo(todo))
        })
      ),
    { dispatch: false }
  );

  removeTodos$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TodosActions.removeTodo),
        switchMap((action) => {
          console.log(action.id)
          return from(this.todoService.deleteTodo(action.id))
        })
      ),
    { dispatch: false }
  );

  updateTodos$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TodosActions.updateTodo, TodosActions.toggleTodo),
        switchMap((action) => {
          console.log(action.todo)
          return from(this.todoService.updateTodo(action.todo))
        })
      ),
    // Most effects dispatch another action, when an effect doesn't dispatch an action, we should indicate that
    { dispatch: false }
  );
}