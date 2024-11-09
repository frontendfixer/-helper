# TypeScript Helper Functions

A collection of utility functions for common operations in TypeScript/JavaScript applications. These functions provide easy-to-use solutions for string manipulation, encryption, date formatting, and currency formatting.

## Table of Contents

- [Installation](#installation)
- [Functions Overview](#functions-overview)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Dependencies](#dependencies)
- [Error Handling](#error-handling)
- [License](#license)

## Installation

1. Install the required dependencies:

```bash
npm install date-fns
# or
pnpm add date-fns
 # or
deno install
```

2. Copy the helper functions file into your project:

```bash
utils/helpers.ts
```

3. Import the functions you need:

```typescript
import { createSlug, formatPrice, formattedDate } from "./utils/helpers";
```

## Functions Overview

| Function          | Description                            | Usage                        |
| ----------------- | -------------------------------------- | ---------------------------- |
| `createSlug`      | Converts strings to URL-friendly slugs | String manipulation for URLs |
| `toTitleCase`     | Converts strings to Title Case         | Text formatting              |
| `slugToTitleCase` | Converts URL slugs to Title Case       | Text formatting              |
| `generateKey`     | Generates encryption keys              | Cryptography                 |
| `encryptText`     | Encrypts text data                     | Data security                |
| `decryptText`     | Decrypts encrypted data                | Data security                |
| `sleep`           | Creates time delays                    | Async operations             |
| `formattedDate`   | Formats dates                          | Date handling                |
| `formatPrice`     | Formats currency values                | Currency display             |

## Usage Examples

### String Manipulation

```typescript
// Create URL-friendly slugs
const slug = createSlug("Hello World!"); // Output: "hello-world"
const customSlug = createSlug("This Is A Test", "_"); // Output: "this_is_a_test"

// Convert to Title Case
const title = toTitleCase("hello world"); // Output: "Hello World"
const slugTitle = slugToTitleCase("hello-world"); // Output: "Hello World"
```

### Encryption

```typescript
// Basic encryption workflow
async function secureData() {
  try {
    // Generate a new encryption key
    const key = await generateKey();

    // Encrypt some data
    const encrypted = await encryptText("Secret message", key);

    // Decrypt the data
    const decrypted = await decryptText(encrypted, key);
    console.log(decrypted); // Output: "Secret message"
  } catch (error) {
    console.error("Encryption error:", error);
  }
}
```

### Date Formatting

```typescript
// Format dates
const today = formattedDate(new Date()); // Output: "09/11/2024"
const custom = formattedDate(new Date(), "MM/dd/yyyy"); // Output: "11/09/2024"
```

### Currency Formatting

```typescript
// Format prices
const price1 = formatPrice(1000); // Output: "₹1K"
const price2 = formatPrice(1500.5, {
  currency: "USD",
  notation: "standard",
}); // Output: "$1,500.50"
```

### Async Delays

```typescript
// Create delays in async functions
async function delayExample() {
  console.log("Start");
  await sleep(2000); // Wait for 2 seconds
  console.log("End");

  // With callback
  await sleep(1000, () => {
    console.log("Callback executed");
  });
}
```

## API Reference

### String Functions

#### `createSlug(title: string, replace?: string): string`

Creates a URL-friendly slug from a string.

- `title`: The string to convert
- `replace` (optional): Character to use for replacing spaces (default: "-")
- Throws error if title is empty or invalid

#### `toTitleCase(str: string): string`

Converts a string to Title Case.

- `str`: The input string
- Throws error if input is empty or invalid

[Additional function documentation...]

## Dependencies

- `date-fns`: ^2.x.x - For date formatting operations
- Modern browser with Web Crypto API support for encryption functions

## Error Handling

All functions include comprehensive error handling and input validation. Common errors:

```typescript
try {
  const slug = createSlug(""); // Throws: "Title must be a non-empty string"
  const price = formatPrice(-100); // Throws: "Price cannot be negative"
  const date = formattedDate("invalid-date"); // Throws: "Invalid date provided"
} catch (error) {
  console.error(error);
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
