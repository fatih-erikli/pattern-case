import { pattern, placeholder, predicate } from '../pattern-case';

describe('pattern matching', () => {
  test(('pattern matching with objects in lists'), () => {
    class Vector {
      x: number;
      y: number;
    
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
    
      static Invisible() {
        return new Vector(-1, -1);
      }
    
      static compare(a: Vector, b: Vector) {
        return a.x > b.x && a.y > b.y;
      }
    }

    const canvasState = {
      mode: "start",
      shapes: [],
      selection: [new Vector(1, 1), new Vector(2, 2)],
    }

    const result = pattern(canvasState)
    .case(({ selection: [Vector.Invisible(), Vector.Invisible()] }), ({ selection }) => {
      return 1
    })
    .case(({ selection: [Vector.Invisible(), placeholder] }), ({ selection }) => {
      return 2
    })
    .case(({ selection: predicate(([a, b]: Vector[]) => Vector.compare(a, b)) }), ({ selection }) => {
      return 3
    })
    .case(({ selection: predicate(([a, b]: Vector[]) => !Vector.compare(a, b)) }), () => {
      return 4
    })
    .match()

    expect(result).toBe(4);

  });
  test('null case', () => {
    type Action = 3 | 4 | null;
    const uiAction = 4;

    const result = pattern<Action>(uiAction)
      .case(null, (number) => number)  
      .case(4, (number) => number)
      .match();
    expect(result).toBe(4);
  });
  test('null case', () => {
    type Action = {selectedPost: 1 | null};
    const uiAction: Action = { selectedPost: 1 };

    const result = pattern<Action>(uiAction)
      .case({ selectedPost: null }, (post) => post.selectedPost)  
      .case({ selectedPost: 1 }, (post) => post.selectedPost)
      .match();
    expect(result).toBe(1);
  });
  test('undefined case', () => {
    type Action = {selectedPost: 1 | undefined};
    const uiAction: Action = { selectedPost: 1 };

    const result = pattern<Action>(uiAction)
      .case({ selectedPost: undefined }, (post) => post.selectedPost)  
      .case({ selectedPost: 1 }, (post) => post.selectedPost)
      .match();
    expect(result).toBe(1);
  });
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
  test('pattern matching with nested objects', () => {
    type Action = {
      number: 1,
      a: { a: 2},
      list: [{a: 1}, {b: 1}]
    };
    const uiAction = { number: 1,
      a: { a: 2},
      list: [{a: 1}, {b: 1}] } as Action;

    const result = pattern<Action>(uiAction)
      .case({number: 1,
        a: { a: 2},
        list: [placeholder, {b: 1}]}, ({ number }) => number)
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
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }) => timestamp)
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }) => timestamp)
      .case({ target: "button-1", "event": "mousemove", timestamp: placeholder }, ({ timestamp }) => timestamp)
      .case({ target: "button-1", "event": "mousedown", timestamp: placeholder }, ({ timestamp }) => timestamp)
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
})
