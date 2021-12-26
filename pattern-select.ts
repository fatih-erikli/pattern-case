class NoMatchingPattern extends Error {
  pattern: any;
  constructor(pattern: any) {
    super(`No matching pattern ${JSON.stringify(pattern)}`);
    this.pattern = pattern;
  }
}

export const PlaceholderSymbol = Symbol("Placeholder");
export const CallablePlaceholderSymbol = Symbol("CallablePlaceholder");

type CallablePlaceholder = {
  [CallablePlaceholderSymbol]: true;
  predicate: (value: any) => boolean;
};

type Placeholder = {
  [PlaceholderSymbol]: true;
};

export const placeholder: Placeholder = {
  [PlaceholderSymbol]: true,
};

export const predicate = (_predicate: any): CallablePlaceholder => {
  return {
    [CallablePlaceholderSymbol]: true,
    predicate: (value: any) => _predicate(value),
  };
};

type Pattern<Type> = {
  [Property in keyof Type]?:
    | Type[Property]
    | Record<keyof Type[Property], CallablePlaceholder | Placeholder>
    | CallablePlaceholder
    | Placeholder
    | (Placeholder | keyof Property)[];
};

const _ensureArrayLength = (a: any[], b: any[]) => {
  return !Array.isArray(a) || a.length === b.length;
}

export const pattern = <S>(value: S) => {
  let matched: any;
  let fallThrough: any;

  let _predicate: (a: any, b: any) => boolean;
  if (typeof value === "object") {
    _predicate = (a: any, b: any) =>
      Object.keys(a).every((key) =>
        typeof a[key] === "object"
          ? a[key][CallablePlaceholderSymbol]
            ? a[key].predicate(b[key])
            : _ensureArrayLength(a[key], b[key]) &&
              _predicate(a[key], b[key])
          : a[key][PlaceholderSymbol] || a[key] === b[key]
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
                  PlaceholderSymbol in pattern[key] ||
                  (CallablePlaceholderSymbol in pattern[key] &&
                    (pattern[key] as CallablePlaceholder).predicate(value[key]))
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
