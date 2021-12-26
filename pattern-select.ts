class NoMatchingPattern extends Error {
  pattern: any;
  constructor(pattern: any) {
    super(`No matching pattern ${JSON.stringify(pattern)}`);
    this.pattern = pattern;
  }
}

export const PlaceholderSymbol = Symbol("Placeholder");

type Placeholder = {
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

type Pattern<Type> = {
  [Property in keyof Type]?:
    | Type[Property]
    | Record<keyof Type[Property], Placeholder>
    | Placeholder
    | (Placeholder | keyof Property)[];
};

export const pattern = <S>(value: S) => {
  let matched: any;
  let fallThrough: any;

  let _predicate: (a: any, b: any) => boolean;
  if (typeof value === "object") {
    _predicate = (a: any, b: any) =>
      Object.keys(a).every((key) =>
        typeof a[key] === "object"
          ? a[key][PlaceholderSymbol]
            ? a[key].predicate(b[key])
            : Object.keys(a[key]).length === Object.keys(b[key]).length &&
              _predicate(a[key], b[key])
          : a[key] === PlaceholderSymbol || a[key] === b[key]
      );
  } else {
    _predicate = (a: any, b: any) => a === b;
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
    case(pattern: Pattern<S>, output?: (matched: S) => void) {
      if (fallThrough && output) {
        matched = output(fallThrough);
      }

      if (matched) {
        return breakNext;
      }

      if (_predicate(pattern, value)) {
        // todo: this function went too far it's hard to follow
        // I will reimplement it
        const _replace = (pattern: Pattern<S>): any => {
          let patternWithReplacedSymbols = pattern;
          if (typeof pattern === "object") {
            for (const key in pattern) {
              if (Object.prototype.hasOwnProperty.call(pattern, key)) {
                const patternValue = pattern[key];
                if (typeof patternValue !== "object") {
                  continue;
                }
                if (
                  (PlaceholderSymbol in pattern[key] &&
                    (pattern[key] as Placeholder).predicate(value[key]))
                ) {
                  patternWithReplacedSymbols[key] = value[key];
                } else {
                  patternWithReplacedSymbols[key] = _replace(value[key]);
                }
              }
            }
          } else {
            patternWithReplacedSymbols = pattern;
          }
          return patternWithReplacedSymbols;
        };

        let patternWithReplacedSymbols = _replace(pattern);

        if (!output) {
          fallThrough = patternWithReplacedSymbols;
          return continueNext;
        } else {
          matched = output(patternWithReplacedSymbols);
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
