[![Node.js CI](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml/badge.svg)](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml)

### Pattern Matching in Typescript

Fast and efficient pattern matching in Typescript.

```typescript
test('early exit if the condition has met', () => {
  let executed = false;
  pattern<[number, number, number]>(1, 2, 3)
    .case(1, 2, 3)((a, b, c) => {return 1})
    .case(1, 2, 3)((a, b, c) => {executed = true; return 1})
    .match();
  expect(executed).toBe(false);
});
```

### Fall-through

The function `next` could be used as a placeholder to continue with the next statement.

```typescript
test('fall-through if the callback is not provided', () => {
  const result = pattern<[number, number, number]>(1, 2, 3)
    .case(1, 2, 3)(next)
    .case(1, 2, 3)((a, b, c) => {return 1})
    .match();
  expect(result).toBe(1);
});
```

Happy hacking!
