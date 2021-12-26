[![Node.js CI](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml/badge.svg)](https://github.com/fatih-erikli/pattern-select/actions/workflows/node.js.yml)

#### Disclaimer
I'm learning Typescript and this is how I try to improve my understanding of Generic types. 

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

### Fall-through

The second argument of `case` method is optional. In case if it's not given, the handler of next matched case statement will be evaluated.

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

### Custom predicates

The pattern can be build with functions return boolean values.

```typescript
import { pattern, predicate } from "pattern-select";

type Action = {
  target: string;
  event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
  timestamp: number;
};
const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;

pattern<Action>(uiAction)
  .case({target: "button-2", "event": ((value) => value === "mousedown"), timestamp: placeholder})
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder})
  .case({target: "button-1", "event": "test", timestamp: placeholder})
  .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
  .match() // 1
```

### Signature

Expected type of case statements are partial of the object given with pattern.

```typescript
type Pattern<T> = {
  [P in keyof T]?: typeof Symbol('placeholder') | T[P];
};
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
console.timeEnd('ts-pattern'); // 6ms

console.time('pattern-select')
const result2 = pattern<Action>(uiAction)
.case({target: "button-2", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
.case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
.case({target: "button-1", "event": "test", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
.case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
.match()
console.log('result', result2);
console.timeEnd('pattern-select'); // 1ms
```

### Blog post

<https://fatih-erikli.com/pattern-matching-in-typescript.html>

Happy hacking!

