import { pattern, placeholder, predicate } from '../pattern-select';

describe('pattern matching', () => {
  test('pattern matching primitives', () => {
    type Action = 3 | 4;
    const uiAction = 4;

    const result = pattern<Action>(uiAction)
      .case(4, (number) => number)  
      .case(3, (number) => number)
      .match();
    expect(result).toBe(4);
  });
  test('pattern matching with objects', () => {
    type Action = {
      number: 1,
      object: 1
    };
    const uiAction: Action = { number: 1, object: 1 };

    const result = pattern<Action>(uiAction)
      .case({ number: 1, object: 1}, ({ number }) => number)
      .match();
    expect(result).toBe(1);
  });
  test('pattern matching with nested objects', () => {
    type Action = {
      number: 1,
      object: {nested: "nested"} 
    };
    const uiAction = { number: 1, object: {nested: "nested"} } as Action;

    const result = pattern<Action>(uiAction)
      .case( { number: placeholder, object: {nested: "nested"} }, ({ object: {nested} }) => nested)
      .match();
    expect(result).toBe("nested");
  });
  test('pattern matching with nested objects', () => {
    type Action = {
      number: 1,
      list: [1, 2]
    };
    const uiAction = { number: 1, list: [1,2] } as Action;

    const result = pattern<Action>(uiAction)
      .case({number: 1, list: [placeholder, 2]}, ({ number }) => number)
      .match();
    expect(result).toBe(1);
  });
  test('pattern matching with placeholders', () => {
    type Action = {
      target: "button-1";
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = { target: "button-1", "event": "mousedown", "timestamp": 1 } as Action;

    const result = pattern<Action>(uiAction)
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }: any) => timestamp)
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }: any) => timestamp)
      .case({ target: "button-1", "event": "mousemove", timestamp: placeholder }, ({ timestamp }: any) => timestamp)
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }: any) => timestamp)
      .match();
    expect(result).toBe(1);
  })

  test('pattern matching with custom predicate', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = { target: "button-1", "event": "mousedown", "timestamp": 1 } as Action;


    const result2 = pattern<Action>(uiAction)
      .case({ target: "button-1", "event": "mousedown", timestamp: predicate(() => 1) }, ({ timestamp }: any) => timestamp)
      .match();
    expect(result2).toBe(1);

    const result4 = pattern<Action>(uiAction)
      .case({ target: "button-1", "event": "mousedown", timestamp: predicate(() => true) }, ({ timestamp }: any) => timestamp)
      .match();
    expect(result4).toBe(1);
  })

  test('pattern matching with fall-through', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = { target: "button-1", "event": "mousedown", "timestamp": 1 } as Action;
    const result = pattern<Action>(uiAction)
      .case({ target: placeholder, timestamp: placeholder })
      .case({ target: "should be previous target", "event": "mousedown", timestamp: placeholder }, ({ target }: any) => target)
      .match();
    expect(result).toBe("button-1");
  })
})
