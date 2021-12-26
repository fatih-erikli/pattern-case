import { pattern, placeholder } from '../pattern-select';

describe('pattern matching', () => {
  test('pattern matching with objects', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;
    
    const result = pattern<Action>(uiAction)
      .case({target: "button-2", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .case({target: "button-1", "event": "mousemove", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .match();
    expect(result).toBe(1);
  })

  test('pattern matching with custom predicate', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;
    

    const result2 = pattern<Action>(uiAction)
      .case({target: "button-1", "event": "mousedown", timestamp: ((val: any) => true)}, ({ timestamp }: any) => timestamp)
      .match();
    expect(result2).toBe(1);

    const result4 = pattern<Action>(uiAction)
      .case({target: "button-1", "event": "mousedown", timestamp: ((val: any) => val === 1)}, ({ timestamp }: any) => timestamp)
      .match();
    expect(result4).toBe(1);
  })

  test('pattern matching with fall-through', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;
    
    const result = pattern<Action>(uiAction)
      .case({target: placeholder, "event": "mouseup", timestamp: placeholder})
      .case({target: placeholder, "event": "mousedown", timestamp: placeholder}, ({ target }: any) => target)
      .match();
    expect(result).toBe("button-1");

    const result2 = pattern<Action>(uiAction)
      .case({target: placeholder, timestamp: placeholder})
      .case({target: "should be previous target", "event": "mousedown", timestamp: placeholder}, ({ target }: any) => target)
      .match();
    expect(result2).toBe("button-1");

    type Action2 = Action & {
      partialKey: number;
    };
    const result3 = pattern<Action2>({
      ...uiAction,
      partialKey: 1
    })
      .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ partialKey }: any) => partialKey)
      .match();
    expect(result3).toBe(undefined);
  })

  test('Matching result should be Partial of given object', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
      partialKey: 1
    };
    const uiAction: Action = {partialKey: 1, target: "button-1", "event": "mousedown", "timestamp": 1};
    
   
    const result3 = pattern<Action>(uiAction)
      .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ partialKey }: any) => partialKey)
      .match();
    expect(result3).toBe(undefined);
  })
})
