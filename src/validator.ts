interface RuleSet<K> {
    [key: string]: Array<Validator<K>>;
}

type Validator<K> = SimpleValidator<K> | ValidatorFunction;

type SimpleValidator<ValidatorKey> = [ValidatorKey] | [ValidatorKey, any[]];

type Maybe<T> = undefined | T;

type ValidatorFunction = (
    key: string,
    value: any,
    object: any,
    ...args: any[]
) => undefined | ValidationError;

interface DefaultValidators {
    [key: string]: ValidatorFunction;
}

interface ValidationError {
    key: string;
    validator: string;
    message: string;
}

type ValidationResult = [boolean, ValidationError[]];

export class ConfigValidator<ValidatorKey extends keyof DefaultValidators> {
    private rules: RuleSet<ValidatorKey>;

    constructor(rules: RuleSet<ValidatorKey>) {
        this.rules = rules;
    }

    public validate(input: any): ValidationResult {
        const errors: ValidationError[] = [];
        for (const [key, validators] of Object.entries(this.rules)) {
            for (const validator of validators) {
                const [fn, args] = this.unpackRule(validator);
                const possibleError = fn(key, input[key], input, ...args);
                if (possibleError) {
                    errors.push(possibleError);
                }
            }
        }
        return [errors.length === 0, errors];
    }

    private unpackRule(
        validator: Validator<ValidatorKey>,
    ): [ValidatorFunction, any[]] {
        let validationFn;
        let args: any[] = [];
        if (typeof validator === "function") {
            validationFn = validator;
        } else {
            const name = validator[0];
            validationFn = DEFAULT_VALIDATORS[name];
            if (validator.length === 2) {
                args = validator[1] as any[];
            }
        }
        return [validationFn, args];
    }
}

const DEFAULT_VALIDATORS: DefaultValidators = {
    isArray: (key, value): Maybe<ValidationError> => {
        return !Array.isArray(value)
            ? {
                key,
                message: `${key} must be an Array`,
                validator: "isArray",
            }
            : undefined;
    },
};
