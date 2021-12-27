export class NoMatchingPattern extends Error {
  pattern: any;
  constructor(pattern: any) {
    super(`No matching pattern ${JSON.stringify(pattern)}`);
    this.pattern = pattern;
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

export const pattern = <S>(value: S) => {
  let matched: any;
  let fallThrough: any;
  let result: any;

  const match = (pattern: any, matchWith: any) => {
    let matches: boolean = false;
    switch (typeof pattern) {
      case "object":
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
        break;
      default:
        matches = pattern === matchWith;
        break;
    }
    if (matches) {
      return pattern;
    }
  }

  const breakNext = {
    match() {
      return result;
    },
    case() {
      return breakNext;
    },
  };

  const continueNext = {
    case(pattern: Pattern<S>, output?: (matched: S) => void) {
      matched = match(pattern, value);

      if (fallThrough && output) {
        result = output(value);
        matched = true;
        fallThrough = undefined;
      }

      if (matched) {
        if (output) {
          result = output(value);
          matched = true;
        } else {
          fallThrough = matched;
        }
      }

      if (fallThrough || !matched) {
        return continueNext;
      }

      return breakNext;
    },
    match() {
      throw new NoMatchingPattern(value);
    },
  };
  return continueNext;
};

