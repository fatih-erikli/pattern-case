export const placeholder = Symbol("placeholder");

class NoMatchingPattern extends Error {
  pattern: any;
  constructor(pattern: any) {
    super(`No matching pattern ${JSON.stringify(pattern)}`);
    this.pattern = pattern;
  }
}
type predicate = (value: any) => boolean;

type Pattern<Type> = {
  [Property in keyof Type]?: predicate | symbol | Type[Property];
};

export const pattern = <S>(value: S) => {
  let matched: any;
  let fallThrough: any;

  let predicate: any;
  let isObject = typeof value === "object";

  if (isObject) {
    predicate = (a: any, b: any) =>
      Object.keys(a).every((key) =>
        typeof a[key] === "function"
          ? a[key](b[key])
          : a[key] === placeholder || a[key] === b[key]
      );
  } else {
    predicate = (a: any, b: any) => a === b;
  }

  const breakNext = {
    match() {
      return matched;
    },
    case(_: Pattern<S>, __?: (matched: S) => void) {
      return breakNext;
    },
  };

  const continueNext = {
    case(
      pattern: Pattern<S>,
      output?: (matched: S) => void
    ) {
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
              if (patternValue === placeholder || typeof patternValue === 'function') {
                patternWithReplacedSymbols[key] = value[key];
              }
            }
          }
        } else {
          patternWithReplacedSymbols = pattern;
        }
        if (!output) {
          fallThrough = patternWithReplacedSymbols;
          return continueNext;
        } else {
          matched = output(patternWithReplacedSymbols as S);
          return breakNext;
        }
      }
      return continueNext;
    },
    match() {
      throw new NoMatchingPattern(value);
    },
  };
  return continueNext;
};
