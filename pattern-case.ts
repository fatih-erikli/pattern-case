export class NoMatchingPattern extends Error {
  value: any;
  constructor(value: any) {
    super(`No matching pattern for ${JSON.stringify(value)}`);
    this.value = value;
  }
}

export const PlaceholderSymbol = Symbol("Placeholder");

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

export const pattern = <S>(value: S) => {
  let matched: boolean;
  let result: any;

  const match = (pattern: any, matchWith: any): boolean => {
    let matches: boolean = false;
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
      matched = match(pattern, value);

      if (matched) {
        result = output(value);
      }

      if (matched) {
        return breakNext;
      } else {
        return continueNext;
      }
    },
    match() {
      throw new NoMatchingPattern(value);
    },
  };
  return continueNext;
};
