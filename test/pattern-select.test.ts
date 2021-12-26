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

  test('pattern matching with fall-through', () => {
    type Action = {
      target: string;
      event: "mousedown" | "mouseup" | "mousemove" | "touchmove";
      timestamp: number;
    };
    const uiAction = {target: "button-1", "event": "mousedown", "timestamp": 1} as Action;
    
    const result = pattern<Action>(uiAction)
      .case({target: placeholder, "event": "mouseup", timestamp: placeholder})
      .case({target: placeholder, "event": "mousedown", timestamp: placeholder}, ({ event }: any) => event)
      .case({target: "button-1", "event": "mousemove", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .case({target: "button-1", "event": "mousedown", timestamp: placeholder}, ({ timestamp }: any) => timestamp)
      .match();
    expect(result).toBe("mousedown");
  })
})
