Based on the `createAsyncThunks` function and the provided examples, here's a comprehensive breakdown of the keys and values that a developer can use when defining thunks:

1. `payloadCreator` (Function, required):
   - This is the main function that performs the API call or async operation.
   - It receives two arguments: `params` (user-provided arguments) and `thunkApi` (contains dispatch, getState, etc.).
   - Should return a promise or use async/await.

2. `options` (Object, optional):
   - Additional options for `createAsyncThunk`.
   - Can include properties like `condition`, `dispatchConditionRejection`, etc.

3. `dispatchAfterReject` (Function, optional):
   - Called after the thunk is rejected.
   - Receives `params`, `thunkApi`, and `error` as arguments.
   - Useful for performing additional actions on error.

4. `dispatchAfterFulfil` (Function, optional):
   - Called after the thunk is fulfilled successfully.
   - Receives `params`, `thunkApi`, and `response` as arguments.
   - Useful for performing additional actions on success.

5. `cacheResult` (Object, optional):
   - Enables caching of the API result.
   - Properties:
     - `interval` (Number): Cache duration in minutes.
     - `path` (String, optional): Custom path for cache key. Defaults to `${sliceName}/${apiName}`.

6. `addCases` (Object, optional):
   - Defines additional reducer cases for the thunk.
   - Keys can be `fulfilled`, `rejected`, `pending`.
   - Values are reducer functions that receive `state` and `action`.

7. `addMatchers` (Object, optional):
   - Defines matcher cases for the thunk.
   - Similar structure to `addCases`.

8. `addDefaultCases` (Object, optional):
   - Defines default cases for the thunk.
   - Similar structure to `addCases`.

Advanced Usage:

1. Dynamic cache key:
   - The `cacheResult.path` can be customized to create unique cache keys.

2. Conditional caching:
   - Developers can implement conditional caching by manipulating the `cacheResult` object.

3. Chaining actions:
   - Use `dispatchAfterFulfil` or `dispatchAfterReject` to dispatch additional actions.

4. Custom error handling:
   - Implement custom error logic in `payloadCreator` using `rejectWithValue`.

5. Optimistic updates:
   - Implement optimistic updates using the `pending` case in `addCases`.

6. Selective state updates:
   - Use `addCases` to selectively update specific parts of the state based on the API response.

7. Complex state transformations:
   - Leverage `addCases` for complex state transformations after API calls.

8. Conditional API calls:
   - Use the `condition` option in `options` to conditionally execute the thunk.

This structure provides a powerful and flexible way to define API calls and manage their lifecycle, state updates, and side effects within the Redux ecosystem.

Certainly! Let's dive deeper into the use cases, keys, and data that can be passed to various parts of the thunk configuration:

1. `options` (Object):
   - `condition` (Function): Determines if the thunk should run.
     Use case: Prevent unnecessary API calls if certain conditions are not met.
     Example: `condition: (arg, { getState }) => getState().user.isLoggedIn`

   - `dispatchConditionRejection` (Boolean): If true, dispatches a rejected action when the condition returns false.
     Use case: Handle rejected conditions in reducers or middleware.

   - `idGenerator` (Function): Customizes the generated request ID.
     Use case: Create meaningful request IDs for tracking or debugging.

   - `serializeError` (Function): Customizes error serialization.
     Use case: Standardize error formats across your application.

   - `getPendingMeta` (Function): Customizes the meta object for pending action.
     Use case: Add extra metadata to pending actions for tracking or UI updates.

2. `dispatchAfterReject` (Function):
   Use case: Perform cleanup actions, log errors, or dispatch additional actions on failure.
   Example: `dispatchAfterReject: (params, { dispatch }, error) => dispatch(logError(error))`

3. `dispatchAfterFulfil` (Function):
   Use case: Update related state, trigger side effects, or chain additional actions on success.
   Example: `dispatchAfterFulfil: (params, { dispatch }, response) => dispatch(updateUserProfile(response.data))`

4. `cacheResult` (Object):
   - `interval` (Number): Cache duration in minutes.
   - `path` (String): Custom cache key path.
   Use case: Optimize performance by caching frequently accessed, slowly-changing data.
   Example: 
   ```javascript
   cacheResult: {
     interval: 5,
     path: `user/profile/${userId}`
   }
   ```

5. `addCases`, `addMatchers`, `addDefaultCases` (Objects):
   These objects allow you to define how the state should be updated in response to different thunk action states.

   - `fulfilled` (Function): Handles successful API calls.
     Use case: Update state with API response data.
     Example: `fulfilled: (state, action) => { state.data = action.payload }`

   - `rejected` (Function): Handles failed API calls.
     Use case: Update error state, reset loading flags.
     Example: `rejected: (state, action) => { state.error = action.error.message }`

   - `pending` (Function): Handles the pending state of API calls.
     Use case: Set loading flags, prepare state for incoming data.
     Example: `pending: (state) => { state.loading = true }`

When to use what:

1. Use `condition` in `options` when you need to prevent unnecessary API calls based on current state or arguments.

2. Use `dispatchAfterReject` when you need to perform specific actions only on API failure, like showing error notifications.

3. Use `dispatchAfterFulfil` when you need to perform actions after a successful API call, like updating related state or triggering other effects.

4. Use `cacheResult` for API calls that fetch data that doesn't change frequently, to improve performance and reduce server load.

5. Use `addCases` for straightforward state updates based on API call status.

6. Use `addMatchers` for more complex state updates that might apply to multiple thunks or action types.

7. Use `addDefaultCases` for fallback state updates that should apply if no other cases match.

8. Use `payloadCreator` for the main API call logic, including any request formatting or response processing.

By leveraging these options, developers can create highly customized and efficient API handling logic, reducing boilerplate and improving maintainability of Redux code.

Certainly! Let's break down the `useApiCaller` hook and its options in detail:

The `useApiCaller` hook is used to call API functions (thunks) with additional functionality like loading state management, error handling, and success messages. Here's a comprehensive guide on how to use it and its supported options:

Basic Usage:
```javascript
const { loading, data, error, callApi } = useApiCaller(apiFunction, initOptions)
```

Parameters:
1. `apiFunction`: The Redux thunk function to be called.
2. `initOptions`: Initial options for the hook.

Return Values:
- `loading`: Boolean indicating if the API call is in progress.
- `data`: The data returned by the API call.
- `error`: Any error that occurred during the API call.
- `callApi`: Function to trigger the API call.

Detailed Options:

1. `initOptions` (object):
   - `initLoading` (boolean): Set initial loading state.
     Use case: When you want to show a loading indicator immediately, before the first API call.
   
   - `callOnInterval` (object): Set up automatic interval calls.
     - `interval` (number): Time in milliseconds between calls.
     - `breakInterval` (function): Function to determine if the interval should be stopped.
     Use case: For polling APIs or refreshing data periodically.

2. Options for `callApi` function:
   When calling the API, you can pass an options object as the second argument:

   - `onInit` (function): Called before the API call is made.
     Use case: Perform setup actions or state changes before the API call.

   - `onSuccess` (function): Called when the API call succeeds.
     Arguments: `(data)`
     Use case: Perform actions with the returned data, like updating local state.

   - `onError` (function): Called when the API call fails.
     Arguments: `(errorData)`
     Use case: Handle specific error cases or perform error-related actions.

   - `onFinally` (function): Called after the API call, regardless of success or failure.
     Arguments: `(promiseData)`
     Use case: Perform cleanup actions that should happen in both success and error cases.

   - `successMessage` (string | function | boolean):
     - If string: Displays this message on success.
     - If function: Calls this function with the response data to generate the message.
     - If true: Uses the `message` field from the API response.
     Use case: Show user-friendly success notifications.

   - `errorMessage` (string | function | boolean):
     - If string: Displays this message on error.
     - If function: Calls this function with the error data to generate the message.
     - If true: Uses the `message` field from the error response or a default error message.
     Use case: Show user-friendly error notifications.

Usage Examples:

1. Basic usage:
   ```javascript
   const { callApi } = useApiCaller(fetchUserData)
   callApi({ userId: 123 })
   ```

2. With success and error messages:
   ```javascript
   const { callApi } = useApiCaller(updateUserProfile)
   callApi(
     { name: 'John Doe' },
     { 
       successMessage: 'Profile updated successfully',
       errorMessage: 'Failed to update profile'
     }
   )
   ```

3. With custom success and error handling:
   ```javascript
   const { callApi } = useApiCaller(fetchOrders)
   callApi(
     { status: 'pending' },
     {
       onSuccess: (data) => {
         setOrders(data.orders)
         updateTotalCount(data.totalCount)
       },
       onError: (error) => {
         logError(error)
         setFallbackData()
       }
     }
   )
   ```

4. With interval calls:
   ```javascript
   const { callApi } = useApiCaller(checkStatus, {
     callOnInterval: {
       interval: 5000,
       breakInterval: ([data, error]) => data?.status === 'completed' || error
     }
   })
   callApi({ jobId: 456 })
   ```

5. With all options:
   ```javascript
   const { callApi } = useApiCaller(complexOperation, { initLoading: true })
   callApi(
     { param1: 'value1', param2: 'value2' },
     {
       onInit: () => prepareForOperation(),
       onSuccess: (data) => processResult(data),
       onError: (error) => handleSpecificError(error),
       onFinally: () => cleanupResources(),
       successMessage: (data) => `Operation completed with result: ${data.result}`,
       errorMessage: (error) => `Operation failed: ${error.message}`
     }
   )
   ```

This comprehensive approach to API calling provides a flexible and powerful way to handle various scenarios in React components while leveraging Redux for state management.

I would rate this documentation as a solid 8 out of 10. It provides a comprehensive overview of the system's key components and their usage, which is certainly helpful for a new developer. However, there are some areas that could benefit from additional clarity or examples:

1. Overall System Architecture:
   - A high-level diagram showing how different parts of the system (Redux store, slices, thunks, components) interact would be beneficial.
   - An explanation of the overall flow from API call to state update could help in understanding the big picture.

2. createAsyncThunks:
   - More examples of complex use cases, such as handling nested API calls or managing dependencies between multiple API calls.
   - Clarification on how the caching mechanism works with the rest of the Redux store.

3. useApiCaller:
   - Examples of how to handle loading states in components using the returned `loading` value.
   - More detailed explanation of error handling and how to display errors in the UI.

4. Selectors:
   - The documentation doesn't cover the usage of selectors in depth. Examples of how to use the created selectors in components would be helpful.

5. Adapters:
   - More explanation on how adapters are used in the system and how they interact with the reducers and selectors.

6. Redux Store Configuration:
   - A more detailed explanation of the store structure and how different slices are organized.

7. Performance Considerations:
   - Guidelines on when to use caching and how to optimize API calls for performance.

8. Testing:
   - The documentation lacks information on how to test the various parts of the system (thunks, reducers, selectors, hooks).

9. Error Handling Strategy:
   - A more comprehensive guide on the error handling strategy across the application would be beneficial.

10. Custom Work and Staging Sites:
    - These concepts are mentioned in the selectors but not explained in detail. More context would be helpful.

11. DataSharingLayer:
    - The `useDataSharingLayer` hook is used but not explained. Its purpose and usage should be documented.

12. Middleware:
    - If any custom middleware is used, it should be documented.

13. Code Style and Best Practices:
    - Guidelines on code style, naming conventions, and best practices specific to this system would help maintain consistency.

14. Migration and Updating:
    - Instructions on how to add new features, slices, or API endpoints to the existing system.

15. Dependencies and Setup:
    - A list of key dependencies and setup instructions for a new developer to get started.

16. Common Pitfalls:
    - A section on common mistakes or pitfalls when using this system and how to avoid them.

17. Advanced Features:
    - More in-depth explanation of advanced features like the interval-based API calling in useApiCaller.

By addressing these points, the documentation would provide a more complete picture of the system, making it easier for new developers to understand and work with the codebase effectively.

Certainly! I'll cover each of these points to provide a comprehensive documentation of the system.

1. Overall System Architecture:

The system is built on React and Redux, utilizing Redux Toolkit for efficient state management. Here's a high-level overview:

```
[React Components] <-> [useApiCaller Hook] <-> [Redux Store]
                                                |
                                        [Thunks & Reducers] <-> [API]
                                                |
                                            [Selectors]
                                                |
                                            [Adapters]
```

- React Components use the useApiCaller hook to interact with the Redux store.
- Thunks handle asynchronous logic and API calls.
- Reducers update the store based on action results.
- Selectors efficiently access and compute state data.
- Adapters normalize data for consistent state management.

2. createAsyncThunks:

createAsyncThunks is a utility function that wraps Redux Toolkit's createAsyncThunk, adding features like caching and additional lifecycle hooks.

Example of a complex use case with nested API calls:

```javascript
const fetchUserWithPosts = createAsyncThunks('user/fetchWithPosts', {
  payloadCreator: async (userId, { dispatch }) => {
    const user = await api.fetchUser(userId);
    const posts = await api.fetchUserPosts(userId);
    return { user, posts };
  },
  dispatchAfterFulfil: (userId, { dispatch }, response) => {
    dispatch(updateUserLastLogin(userId));
  },
  cacheResult: {
    interval: 5,
    path: 'user/withPosts'
  }
});
```

3. useApiCaller:

The useApiCaller hook manages API call states and provides a consistent interface for components.

Handling loading and error states in components:

```javascript
const UserProfile = ({ userId }) => {
  const { loading, data: user, error, callApi } = useApiCaller(fetchUser);

  useEffect(() => {
    callApi({ userId });
  }, [userId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!user) return null;

  return <UserInfo user={user} />;
};
```

4. Selectors:

Selectors efficiently derive data from the Redux store. They can be used with the useSelector hook in components.

```javascript
const UserPostCount = ({ userId }) => {
  const postCount = useSelector(state => selectUserPostCount(state, userId));
  return <div>Post Count: {postCount}</div>;
};
```

5. Adapters:

Adapters normalize data for consistent state management. They provide a set of CRUD operations and selectors.

```javascript
const userAdapter = createEntityAdapter({
  selectId: user => user.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name)
});

const userSelectors = userAdapter.getSelectors(state => state.users);
```

6. Redux Store Configuration:

The store is configured using configureStore from Redux Toolkit. Each slice of the store corresponds to a domain of the application.

```javascript
const store = configureStore({
  reducer: {
    users: userReducer,
    posts: postReducer,
    comments: commentReducer,
    // ... other reducers
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(customMiddleware)
});
```

7. Performance Considerations:

- Use selectors for derived data to prevent unnecessary re-renders.
- Implement caching for frequently accessed, slowly changing data.
- Use pagination or infinite scrolling for large datasets.

8. Testing:

- Unit test reducers and selectors using Jest.
- Use React Testing Library for component tests.
- Mock API calls in thunk tests using Jest mock functions.

Example thunk test:

```javascript
test('fetchUser thunk', async () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  await fetchUser(1)(dispatch, getState);
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
    type: 'user/fetchUser/pending'
  }));
  // ... more assertions
});
```

9. Error Handling Strategy:

- Use try-catch in thunks to handle API errors.
- Dispatch error actions to update the global error state.
- Use the errorMessage option in useApiCaller for component-level error handling.

10. Custom Work and Staging Sites:

Custom Work refers to specific tasks or projects associated with a site. Staging Sites are temporary copies of live sites used for testing changes.

```javascript
const selectCustomWorksForSite = createSelector(
  [selectAllCustomWorks, (state, siteId) => siteId],
  (customWorks, siteId) => customWorks.filter(work => work.siteId === siteId)
);
```

11. DataSharingLayer:

The DataSharingLayer is a context-based system for sharing data across components without prop drilling.

```javascript
const { pushSuccess, pushError } = useDataSharingLayer();
pushSuccess('Operation completed successfully');
```

12. Middleware:

Custom middleware can be added to the Redux store to intercept actions and add additional logic.

```javascript
const loggingMiddleware = store => next => action => {
  console.log('Dispatching', action);
  let result = next(action);
  console.log('Next state', store.getState());
  return result;
};
```

13. Code Style and Best Practices:

- Use functional components and hooks.
- Keep components small and focused.
- Use PropTypes for type checking.
- Follow Redux best practices (immutability, avoid nested state, etc.).

14. Migration and Updating:

To add a new feature:
1. Create a new slice if needed.
2. Define new thunks and reducers.
3. Update selectors and adapters as necessary.
4. Create new components that use the new state.

15. Dependencies and Setup:

Key dependencies:
- React
- Redux & Redux Toolkit
- React-Redux
- Axios (or another HTTP client)

Setup:
1. Clone the repository
2. Run `npm install`
3. Set up environment variables
4. Run `npm start` for development

16. Common Pitfalls:

- Mutating state directly in reducers (use immer or spread syntax).
- Overusing useEffect for data fetching (prefer declarative data fetching).
- Not handling loading and error states in components.

17. Advanced Features:

Interval-based API calling in useApiCaller:

```javascript
const { callApi } = useApiCaller(pollJobStatus, {
  callOnInterval: {
    interval: 5000,
    breakInterval: ([data, error]) => data?.status === 'completed' || error
  }
});

useEffect(() => {
  callApi({ jobId: '123' });
}, []);
```

This setup will call the API every 5 seconds until the job is completed or an error occurs.

This comprehensive documentation should provide a solid foundation for new developers to understand and work with the system effectively. It covers the architecture, key concepts, best practices, and advanced features of the application.

I'll provide a comprehensive example that covers most aspects of the system. We'll create a "Tasks" feature, which will demonstrate how to create a slice, define APIs, use adapters, and utilize the system's various options.

1. Creating a new slice (tasks/tasksSlice.js):

```javascript
import { createSlice } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { createAsyncThunks, makeExtraReducers } from '../helpers';

// Create an adapter for tasks
export const taskAdapter = createEntityAdapter({
  selectId: (task) => task.id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

// Define the slice name
export const tasksSliceName = 'tasks';

// Define initial state
const initialState = taskAdapter.getInitialState({
  loading: false,
  error: null,
});

// Define thunks
const thunks = {
  fetchTasksApi: {
    payloadCreator: ({ userId }) => apiCall.get(`/users/${userId}/tasks`),
    cacheResult: {
      interval: 5, // Cache for 5 minutes
      path: `${tasksSliceName}/fetchTasks`,
    },
  },
  addTaskApi: {
    payloadCreator: (task) => apiCall.post('/tasks', task),
    dispatchAfterFulfil: (task, { dispatch }) => {
      dispatch(incrementUserTaskCount(task.userId));
    },
  },
  updateTaskApi: {
    payloadCreator: (task) => apiCall.put(`/tasks/${task.id}`, task),
  },
  deleteTaskApi: {
    payloadCreator: (taskId) => apiCall.delete(`/tasks/${taskId}`),
    dispatchAfterFulfil: (taskId, { dispatch, getState }) => {
      const task = selectTaskById(getState(), taskId);
      if (task) {
        dispatch(decrementUserTaskCount(task.userId));
      }
    },
  },
};

// Create async thunks
export const taskAsyncThunks = createAsyncThunks(tasksSliceName, thunks);

// Create the slice
const tasksSlice = createSlice({
  name: tasksSliceName,
  initialState,
  reducers: {
    setTaskPriority: (state, action) => {
      const { taskId, priority } = action.payload;
      taskAdapter.updateOne(state, { id: taskId, changes: { priority } });
    },
  },
  extraReducers: (builder) => {
    makeExtraReducers(thunks, taskAsyncThunks)(builder);
    builder.addCase(taskAsyncThunks.fetchTasksApi.fulfilled, (state, action) => {
      taskAdapter.setAll(state, action.payload);
      state.loading = false;
    });
    builder.addCase(taskAsyncThunks.addTaskApi.fulfilled, (state, action) => {
      taskAdapter.addOne(state, action.payload);
    });
    builder.addCase(taskAsyncThunks.updateTaskApi.fulfilled, (state, action) => {
      taskAdapter.updateOne(state, { id: action.payload.id, changes: action.payload });
    });
    builder.addCase(taskAsyncThunks.deleteTaskApi.fulfilled, (state, action) => {
      taskAdapter.removeOne(state, action.meta.arg);
    });
  },
});

export const { setTaskPriority } = tasksSlice.actions;

export default tasksSlice.reducer;
```

2. Creating selectors (tasks/tasksSelectors.js):

```javascript
import { createDraftSafeSelector } from '@reduxjs/toolkit';
import { taskAdapter, tasksSliceName } from './tasksSlice';

export const {
  selectById: selectTaskById,
  selectIds: selectTaskIds,
  selectEntities: selectTaskEntities,
  selectAll: selectAllTasks,
  selectTotal: selectTotalTasks,
} = taskAdapter.getSelectors((state) => state[tasksSliceName]);

export const selectTasksByUser = createDraftSafeSelector(
  [selectAllTasks, (state, userId) => userId],
  (tasks, userId) => tasks.filter((task) => task.userId === userId)
);

export const selectTasksByPriority = createDraftSafeSelector(
  [selectAllTasks, (state, priority) => priority],
  (tasks, priority) => tasks.filter((task) => task.priority === priority)
);
```

Certainly. Here's an updated and comprehensive version of "3. Using the API and hooks in a component:" that includes the use cases for the promise returned by `callApi`:

3. Using the API and hooks in a component:

```javascript
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import useApiCaller from '../../hooks/useApiCaller';
import { taskAsyncThunks } from './tasksSlice';
import { selectTasksByUser } from './tasksSelectors';

const TaskList = ({ userId }) => {
  const [localTasks, setLocalTasks] = useState([]);

  // Basic usage with all options
  const { 
    loading, 
    data: tasks, 
    error, 
    callApi: fetchTasks 
  } = useApiCaller(taskAsyncThunks.fetchTasksApi, {
    initLoading: true,
    callOnInterval: {
      interval: 60000, // Refresh every minute
      breakInterval: ([data, error]) => error || data?.length > 100
    }
  });

  // Using all options of callApi
  const { callApi: addTask } = useApiCaller(taskAsyncThunks.addTaskApi);
  const { callApi: updateTask } = useApiCaller(taskAsyncThunks.updateTaskApi);
  const { callApi: deleteTask } = useApiCaller(taskAsyncThunks.deleteTaskApi);

  useEffect(() => {
    fetchTasks({ userId });
  }, [userId]);

  const handleAddTask = async (newTask) => {
    try {
      const [addedTask, error] = await addTask(newTask, {
        onInit: () => console.log('Adding task...'),
        onSuccess: (data) => console.log('Task added:', data),
        onError: (error) => console.error('Add task error:', error),
        onFinally: () => console.log('Add task operation completed'),
        successMessage: (data) => `Task "${data.title}" added successfully`,
        errorMessage: (error) => `Failed to add task: ${error.message}`
      });
      if (addedTask) setLocalTasks(prev => [...prev, addedTask]);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleUpdateTask = (updatedTask) => {
    updateTask(updatedTask, {
      successMessage: 'Task updated successfully',
      errorMessage: 'Failed to update task',
    }).then(([updated, error]) => {
      if (updated) {
        setLocalTasks(prev => prev.map(task => task.id === updated.id ? updated : task));
      }
    });
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(taskId, {
      successMessage: true, // Use the message from the API response
      errorMessage: true, // Use the error message from the API response
    }).then(([_, error]) => {
      if (!error) setLocalTasks(prev => prev.filter(task => task.id !== taskId));
    });
  };

  const handleBulkOperation = async () => {
    try {
      const results = await Promise.all([
        addTask({ title: 'Task 1', userId, priority: 'high' }),
        addTask({ title: 'Task 2', userId, priority: 'medium' }),
        addTask({ title: 'Task 3', userId, priority: 'low' }),
      ]);
      const newTasks = results.filter(([task, error]) => task && !error).map(([task]) => task);
      setLocalTasks(prev => [...prev, ...newTasks]);
    } catch (error) {
      console.error('Error in bulk operation:', error);
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Tasks for User {userId}</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title} - Priority: {task.priority}
            <button onClick={() => handleUpdateTask({ ...task, priority: 'high' })}>
              Set High Priority
            </button>
            <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleAddTask({ title: 'New Task', userId, priority: 'medium' })}>
        Add Task
      </button>
      <button onClick={handleBulkOperation}>Perform Bulk Operation</button>
    </div>
  );
};

export default TaskList;
```

This comprehensive example covers most use cases developers might encounter when working with this system, showcasing its flexibility and power in handling complex API interactions and state management.
This example demonstrates:

1. How to create a new slice with initial state, reducers, and extra reducers.
2. How to define APIs using createAsyncThunks with various options:
   - Caching (fetchTasksApi)
   - Dispatching additional actions after fulfillment (addTaskApi, deleteTaskApi)
   - Basic CRUD operations (fetchTasksApi, addTaskApi, updateTaskApi, deleteTaskApi)
3. How to use adapters for normalized state management.
4. How to create and use selectors, including memoized selectors with createDraftSafeSelector.
5. Using `useApiCaller` with all its options:
   - `initLoading`: Set to true for fetchTasks to show initial loading state.
   - `callOnInterval`: Set up automatic interval calls for fetchTasks.

6. Using all options of `callApi`:
   - `onInit`: Executed before the API call (in handleAddTask).
   - `onSuccess`: Executed when the API call succeeds (in handleAddTask).
   - `onError`: Executed when the API call fails (in handleAddTask).
   - `onFinally`: Executed after the API call, regardless of success or failure (in handleAddTask).
   - `successMessage`: 
     - As a string (in handleUpdateTask)
     - As a function returning a string (in handleAddTask)
     - Set to true to use the message from the API response (in handleDeleteTask)
   - `errorMessage`: 
     - As a string (in handleUpdateTask)
     - As a function returning a string (in handleAddTask)
     - Set to true to use the error message from the API response (in handleDeleteTask)

7. Utilizing the promise returned by `callApi`:
   - With async/await and error handling (in handleAddTask and handleBulkOperation)
   - With promise chaining (in handleUpdateTask and handleDeleteTask)
   - For bulk operations using Promise.all (in handleBulkOperation)

8. Handling loading and error states from useApiCaller.

9. Using the data returned by the API call directly from useApiCaller (tasks in the render method)

When to use particular system options:

1. Use createAsyncThunks when defining API calls or any asynchronous operations.
2. Use cacheResult when you want to cache API responses to reduce unnecessary network requests.
3. Use dispatchAfterFulfil or dispatchAfterReject when you need to perform additional actions after an API call succeeds or fails.
4. Use createEntityAdapter when dealing with normalized data (like lists of items).
5. Use createDraftSafeSelector for creating memoized selectors, especially when dealing with complex state derivations.
6. Use useApiCaller in components to trigger API calls and manage their loading/error states.
7. Pass successMessage and errorMessage to useApiCaller when you want to display notifications to the user about the API call result.
8. Use onSuccess, onError, and onFinally callbacks with useApiCaller when you need to perform additional actions in the component based on the API call result.

This example covers most of the system's features and demonstrates best practices for structuring and using the Redux store, APIs, and components.