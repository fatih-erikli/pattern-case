export class NoMatchingPattern extends Error {
  constructor(value: any, patterns: any[]) {
    console.info('value', value);
    console.info('patterns have been tried');
    for (const pattern of patterns) {
      console.debug(pattern);
    }
    super(`No matching pattern`);
  }
}

export const PlaceholderSymbol = Symbol("Placeholder");
export const NextSymbol = Symbol("next");
export type NextStatement = {
  [NextSymbol]: true,
};
export const next: NextStatement = {
  [NextSymbol]: true,
};

export type Placeholder = {
  [PlaceholderSymbol]: true;
  predicate: (value: any) => boolean;
};

export const placeholder: Placeholder = {
  [PlaceholderSymbol]: true,
  predicate: () => true,
};

export const predicate = (_predicate: any): Placeholder => {
  return {
    [PlaceholderSymbol]: true,
    predicate: (value: any) => _predicate(value),
  };
};

export type Pattern<Type> = {
  [Property in keyof Type]?:
  Type[Property]
  | {[P in keyof Type[Property]]: Placeholder | Pattern<Type>}
  | Placeholder
  | any[];
};

export type Statement<S> = {
  case: (pattern: Pattern<S>, output: (match: S) => any) => Statement<S>;
  match: () => S | never;
};

export type WrappedTupple<T> =  { [K in keyof T]: T[K] | Placeholder | Pattern<T[K]> }
// https://github.com/Microsoft/TypeScript/issues/25947

export const tuple = <S extends any[]>(...args: S) => {
  let patternFunction: any = pattern(args);
  const statement = {
    case: (...patternArgs: S | WrappedTupple<S>) =>  {
      return (callback: NextStatement | ((...args: S) => any)) => {
        if (NextSymbol in callback) {
          patternFunction = patternFunction.case(patternArgs);
        } else {
          patternFunction = patternFunction.case(patternArgs, () => (callback as CallableFunction)(...args));
        }
        return statement;
      }
    },
    match: () => {
      return patternFunction.match();
    }
  }
  return statement;
};

export const pattern = <S>(value: S) => {
  let matched: boolean;
  let result: any;
  let triedPatterns: Pattern<S>[] = [];
  let fallThrough = false;

  const match = (pattern: any, matchWith: any): boolean => {
    let matches: boolean = true;
    switch (pattern) {
      case undefined:
      case null:
        matches = pattern === matchWith;
        break;
      default:
        if (typeof pattern === "object") {
          if (PlaceholderSymbol in pattern) {
            if (pattern.predicate(matchWith)) {
              matches = true;
              break;
            }
          }
          for (const key in pattern) {
            if (!Object.prototype.hasOwnProperty.call(pattern, key)) { continue; }
            const element = pattern[key];
            matches = match(element, matchWith[key]);
            if (!matches) {
              break;
            }
          }
        } else {
          matches = pattern === matchWith;
        }
        break;
    }
    return matches
  }

  const breakNext = {
    match() {
      return result;
    },
    case(pattern: Pattern<S>, output: (matched: S) => void): Statement<S> {
      return breakNext;
    },
  };

  const continueNext = {
    case(pattern: Pattern<S>, output: (matched: S) => void): Statement<S> {
      if (!fallThrough) {
        matched = match(pattern, value);
      }

      if (matched) {
        if (!output) {
          fallThrough = true;
        } else {
          result = output(value);
          fallThrough = false;
        }
      }

      if (matched && !fallThrough) {
        return breakNext;
      } else {
        triedPatterns.push(pattern);
        return continueNext;
      }
    },
    match() {
      throw new NoMatchingPattern(value, triedPatterns);
    },
  };
  return continueNext;
};
