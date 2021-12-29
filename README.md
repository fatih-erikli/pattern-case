[![Node.js CI](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml/badge.svg)](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml)

This project is heavily experimental and the implementation has missing parts. The source is extracted from a project and it was optimized for solving a simple pattern matching problem.

For a better and fully-functioning pattern matching in Typescript, please see `ts-pattern` library.

Edit: I worked on the missing parts and refactored the code, but probably there's still some missing parts. Pull requests for improving it even better and the documentation are welcome!

### Pattern Matching in Typescript

Fast and efficient pattern matching in Typescript.

### Usage

```typescript
type Action = {
  target: string;
  event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
  timestamp: number;
};
const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;

pattern<Action>(uiAction)
  .case({target: "button-2", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
  .case({target: "button-1", "event": "test", timestamp: placeholder}, ({ timestamp }) => timestamp)
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
  .match() // 1
```

### With tuples

Looks like this must be the default interface, but typescript does not support mapped tuple types
yet as far as I understand, I am not sure if I implement it correctly.

In future, `tuple` function could be renamed as `pattern`.

```typescript
test('early exit if the condition has met', () => {
  let executed = false;
  tuple<[number, number, number]>(1, 2, 3)
    .case(1, 2, 3)((a, b, c) => {return 1})
    .case(1, 2, 3)((a, b, c) => {executed = true; return 1})
    .match();
  expect(executed).toBe(false);
});
```

### Fall-through

<s>The second argument of `case` method is optional. In case if it's not given, the handler of next matched case statement will be evaluated.</s>
This feature is removed currently, but it looks like I will revert it back. It's useful.

```typescript
type Action = {
  target: string;
  event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
  timestamp: number;
};
const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;

pattern<Action>(uiAction)
  .case({target: "button-2", "event": "mousedown", timestamp: placeholder})
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder})
  .case({target: "button-1", "event": "test", timestamp: placeholder})
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
  .match() // 1
```

### Comparison with ts-pattern
```typescript
console.time('ts-pattern')
const result = match<Action>(uiAction)
.with({target: "button-2", "event": "mousedown", timestamp: __}, ({ timestamp }) => timestamp)
.with({target: "button-1", "event": "mousedown", timestamp: __}, ({ timestamp }) => timestamp)
.with({target: "button-1", "event": "test", timestamp: __}, ({ timestamp }) => timestamp)
.with({target: "button-1", "event": "mousedown", timestamp: __}, ({ timestamp }) => timestamp)
.run();
console.log('result', result);
console.timeEnd('ts-pattern');

console.time('pattern-select')
const result2 = pattern<Action>(uiAction)
.case({target: "button-2", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
.case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
.case({target: "button-1", "event": "test", timestamp: placeholder}, ({ timestamp }) => timestamp)
.case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }) => timestamp)
.match()
console.log('result', result2);
console.timeEnd('pattern-select');
```

### Blog post
<https://fatih-erikli.com/pattern-matching-in-typescript.html>

Happy hacking!
