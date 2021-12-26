export const placeholder = Symbol('placeholder');

export type Pattern<T> = {
  [P in keyof T]?: symbol | T[P];
};

export type MatchedWithPlaceholder<T, U> = T extends U ? T : Pattern<U>;

export const pattern = <S>(value: any) => {
  let matched: any;
  let fallThrough: any;

  let predicate: any;
  let isObject = typeof value === "object";

  if (isObject) {
    predicate = (a:any, b:any) => Object.keys(a).every((key) => a[key] === placeholder || a[key] === b[key]);
  } else {
    predicate = (a:any, b:any) => a === b;
  }

  const breakNext = {
    match(): Partial<S> {
      return matched;
    },
    case() {
      return breakNext;
    }
  };

  const continueNext = {
    case<T>(pattern: MatchedWithPlaceholder<T, S>, output?: (matched: Partial<S>) => void) {
      if (fallThrough && output) {
        matched = output(fallThrough);
      }

      if (matched) {
        return breakNext;
      }

      if (predicate(pattern, value)) {
        let patternWithReplacedSymbols = pattern;
        if (typeof pattern === "object") {
          for (const key in pattern) {
            if (Object.prototype.hasOwnProperty.call(pattern, key)) {
              const patternValue = pattern[key];
              if (patternValue === placeholder) {
                patternWithReplacedSymbols[key] = value[key]
              }
            }
          }
        } else {
          patternWithReplacedSymbols = pattern;
        }
        if (!output) {
          fallThrough = pattern;
          return continueNext;
        } else {
          matched = output(patternWithReplacedSymbols as Partial<S>);
          return breakNext;
        }
      }
      return continueNext;
    },
    match() {
      console.error("No matching pattern for", value);
    }
  };
  return continueNext;
};
