import { TestBed, ComponentFixture, waitForAsync, tick, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store, StoreModule } from '@ngrx/store';
import { HomeComponent } from './home.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoDialogComponent } from '../todo-dialog/todo-dialog.component';
import { todosReducer } from '../state/todos/todo.reducer';
import { TodoService } from '../services/todo.service';
import { EffectsModule } from '@ngrx/effects';
import { TodoEffects } from '../state/todos/todo.effect';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { Todo } from '../models/todo';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TodosApiActions } from '../state/todos/todo.actions';

const todoItems: Todo[] = [
  {
    "title": "Grocery shopping",
    "description": "1. A pack of carrots\n2. Eggs",
    "completed": false
  },
  {
    "title": "Integration Test",
    "description": "10 tests",
    "completed": false
  },
  {
    "title": "Pick up kid from school",
    "description": "",
    "completed": true
  }
];

describe('AppComponent Integration Test', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let todosService: TodoService;
  let store: Store;

  let todosServiceStub: Partial<TodoService> = {
    getTodos: jest.fn().mockReturnValue(of(todoItems)),
    addTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  };

  const matDialogRefStub: Partial<MatDialogRef<any>> = {
    close: () => {},
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        TodoListComponent,
        TodoDialogComponent,
      ],
      imports: [
        StoreModule.forRoot({
          todos: todosReducer,
        }),
        EffectsModule.forRoot([
          TodoEffects
        ]),
        MatDialogModule,
        MatTabsModule,
        MatCardModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: TodoService, useValue: todosServiceStub },
        { provide: MatDialog, useClass: MatDialog },
        { provide: MatDialogRef, useValue: matDialogRefStub },
      ],
    }).compileComponents();

    todosService = TestBed.inject(TodoService);
    // TestBed.overrideProvider(TodoService, { useValue: { getTodos: () => of(todoItems) } });
    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display incomplete To-do list', () => {
    const incompletedTodoListItems = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(incompletedTodoListItems.length).toBe(2);
  });

  it('should display complete To-do list', fakeAsync(() => {
    const completedTab = fixture.debugElement.queryAll(By.css('.mdc-tab'))[1];
    completedTab.nativeElement.click();
    fixture.detectChanges();
    setTimeout(() => {}, 0);
    flush();
    const completedTodoListItems = fixture.debugElement.queryAll(By.css('mat-card'));
    const titleElement = completedTodoListItems[2].query(By.css('mat-card-title'));
    expect(titleElement.nativeElement.textContent).toBe('Pick up kid from school');
  }));

  it('should be able complete an incompleted todo item', fakeAsync(() => {
    let firstIncompletedTodoItem = fixture.debugElement.query(By.css('mat-card'));
    expect(firstIncompletedTodoItem.nativeElement.textContent).toContain(todoItems[0].title);

    const completeButton = firstIncompletedTodoItem
                        .query(By.css('mat-card-actions'))
                        .queryAll(By.css('button'))[2];
    completeButton.nativeElement.click();
    fixture.detectChanges();
    firstIncompletedTodoItem = fixture.debugElement.query(By.css('mat-card'));
    expect(firstIncompletedTodoItem.nativeElement.textContent).not.toContain(todoItems[0].title);

    const completedTab = fixture.debugElement.queryAll(By.css('.mdc-tab'))[1];
    completedTab.nativeElement.click();
    fixture.detectChanges();
    setTimeout(() => {}, 0);
    flush();
    const firstCompletedTodoItem = fixture.debugElement.queryAll(By.css('mat-card'))[1];
    expect(firstCompletedTodoItem.nativeElement.textContent).toContain(todoItems[0].title);
  }));

  fit('should be able complete an incompleted todo item', fakeAsync(() => {
    let firstIncompletedTodoItem = fixture.debugElement.query(By.css('mat-card'));
    expect(firstIncompletedTodoItem.nativeElement.textContent).toContain(todoItems[0].title);
  
    const editButton = firstIncompletedTodoItem
                        .query(By.css('mat-card-actions'))
                        .queryAll(By.css('button'))[1];
    editButton.nativeElement.click();
    fixture.detectChanges();
    tick(500); // Wait for a small delay (adjust the duration if needed)
    expect(fixture).toMatchSnapshot();
  }));
});
