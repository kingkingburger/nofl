```markdown
# No-pl Automatic Timer Code Guidelines

## 1. Project Overview

This project is a web application designed to automatically manage lane-specific no-flash timers for League of Legends players using Korean voice commands. It leverages React, Vite, TailwindCSS, TypeScript, and Whisper WASM for real-time UI updates and voice recognition. Key architectural decisions include a component-based UI, local voice processing, and a domain-driven folder structure.

## 2. Core Principles

- **Maintainability:** Code should be easily understood, modified, and extended by any team member.
- **Performance:** The application should provide a responsive and efficient user experience.
- **Testability:** Code should be written in a way that facilitates unit and integration testing.
- **Readability:** Code should be clear, concise, and well-documented.
- **Consistency:** Adhere to established coding conventions and patterns throughout the project.

## 3. Language-Specific Guidelines

### TypeScript

#### File Organization and Directory Structure

- Follow the Domain-Driven Design principles as outlined in the TRD.
- Group related components, types, and utilities within their respective domain directories.
- Use descriptive file names (e.g., `Timer.tsx`, `timer.ts`, `Timer.module.css`).

#### Import/Dependency Management

- Use absolute imports for modules within the `src` directory (e.g., `import Timer from 'components/Timer/Timer';`).
- Use relative imports for files within the same directory or closely related subdirectories.
- Declare all dependencies in `package.json`.

#### Error Handling Patterns

- Use `try...catch` blocks for handling potential exceptions.
- Implement custom error classes for specific error scenarios.
- Log errors with sufficient context for debugging.

```typescript
// MUST: Example of try...catch block
try {
  // Code that might throw an error
  const result = await someAsyncFunction();
  console.log('Result:', result);
} catch (error: any) {
  console.error('An error occurred:', error.message);
  // Handle the error appropriately (e.g., display an error message to the user)
}
```

### React

#### Component Structure

- Favor functional components with hooks.
- Separate concerns into smaller, reusable components.
- Use prop types for type checking and documentation.
- Use `React.memo` for performance optimization.

#### State Management

- Use React's built-in `useState` and `useContext` hooks for local component state and simple global state management.
- Consider a state management library (e.g., Zustand, Recoil) only if the application grows significantly in complexity. Avoid Redux unless absolutely necessary.

#### Styling

- Use CSS Modules for component-specific styling.
- Follow the BEM (Block, Element, Modifier) naming convention.
- Leverage TailwindCSS utility classes for rapid styling.

```typescript
// MUST: Example of a functional component with hooks
import React, { useState, useEffect } from 'react';
import styles from './Timer.module.css';

interface TimerProps {
  initialTime: number;
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <div className={styles.timer}>{time}</div>;
};

export default Timer;
```

### Whisper WASM

#### Integration

- Create a service module to encapsulate the Whisper WASM interaction.
- Handle potential errors during initialization and recognition.
- Optimize model loading for performance.

#### Fallback

- Implement a fallback to the Web Speech API in case Whisper WASM fails to load or initialize.
- Provide clear instructions to the user if microphone access is denied.

## 4. Code Style Rules

### MUST Follow:

- **Use TypeScript**: All code MUST be written in TypeScript to ensure type safety and maintainability. Rationale: TypeScript provides static typing, which helps catch errors early and improves code readability.
- **Linting and Formatting**: Use ESLint and Prettier to enforce consistent code style. Rationale: Consistent code style improves readability and reduces cognitive load.
- **Meaningful Names**: Use descriptive and meaningful names for variables, functions, and components. Rationale: Clear names make the code easier to understand and maintain.
- **Comments**: Write clear and concise comments to explain complex logic or non-obvious behavior. Rationale: Comments help other developers (and your future self) understand the code's purpose and functionality.
- **Small Functions**: Functions MUST be short and focused, ideally performing a single, well-defined task. Rationale: Smaller functions are easier to understand, test, and reuse.
- **Error Handling**: Implement proper error handling using `try...catch` blocks and custom error classes. Rationale: Robust error handling prevents unexpected crashes and provides valuable debugging information.
- **Avoid `any` type**: Minimize the usage of `any` type in TypeScript. Rationale: Using `any` defeats the purpose of TypeScript's type system.
- **Code Reviews**: All code MUST be reviewed by at least one other team member before being merged into the main branch. Rationale: Code reviews help identify potential issues and ensure code quality.

### MUST NOT Do:

- **Magic Numbers**: Avoid using hardcoded numbers directly in the code. Use named constants instead. Rationale: Named constants improve readability and make it easier to change values in the future.
- **Nested Callbacks**: Avoid deeply nested callbacks (callback hell). Use Promises or async/await for asynchronous operations. Rationale: Nested callbacks make the code difficult to read and maintain.
- **Global Variables**: Avoid using global variables. Use dependency injection or state management solutions instead. Rationale: Global variables can lead to naming conflicts and make the code harder to reason about.
- **Console Logs in Production**: Remove or disable `console.log` statements before deploying to production. Rationale: Console logs can expose sensitive information and impact performance.
- **Ignoring Errors**: NEVER ignore errors. Always handle them appropriately, either by logging them, displaying an error message to the user, or retrying the operation. Rationale: Ignoring errors can lead to unexpected behavior and make it difficult to debug problems.
- **Complex State Management**: Don't introduce complex state management patterns (e.g., Redux) prematurely. Start with React's built-in state management and only introduce more complex solutions if necessary. Rationale: Over-engineering can add unnecessary complexity and make the code harder to understand.
- **Huge Components**: Avoid creating massive components with hundreds of lines of code. Break down complex components into smaller, reusable sub-components. Rationale: Smaller components are easier to understand, test, and maintain.

## 5. Architecture Patterns

### Component/Module Structure Guidelines

- **Domain-Driven Design**: Organize code based on the business domain (e.g., `components/Timer`, `services/speechRecognition`).
- **Layered Architecture**: Separate UI components, business logic, and data access layers.
- **Reusable Components**: Design components to be reusable across different parts of the application.
- **Single Responsibility Principle**: Each component or module should have a single, well-defined responsibility.

### Data Flow Patterns

- **Unidirectional Data Flow**: Data flows from parent components to child components via props, and changes are propagated back up via callbacks.
- **State Management**: Use React's `useState` and `useContext` for local component state and simple global state. Consider Zustand for more complex state management needs.
- **API Calls**: Encapsulate API calls in service modules.

### State Management Conventions

- **Local State**: Use `useState` for component-specific state.
- **Context API**: Use `useContext` for simple global state that doesn't require complex updates.
- **Zustand (Optional)**: Use Zustand for more complex global state management.

### API Design Standards

- **RESTful APIs**: Follow RESTful principles when designing APIs.
- **JSON Format**: Use JSON for request and response bodies.
- **Error Handling**: Return appropriate HTTP status codes and error messages.

```typescript
// MUST: Example of a service module for API calls
import axios from 'axios';

const API_BASE_URL = '/api'; // Or Cloudflare Worker URL

export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    throw error; // Re-throw the error for handling in the component
  }
};
```
```typescript
// MUST NOT: Example of placing API logic directly in a component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyComponent = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    // AVOID: Directly calling API in component
    axios.get('/api/data')
      .then(response => setData(response.data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>{/* ... */}</div>
  );
};

export default MyComponent;

// Explanation: This approach tightly couples the component with the API, making it harder to test and reuse.  Move the API call to a dedicated service.
```
