interface RuleSet<K> {
    [key: string]: Array<Validator<K>>;
}

type Validator<K> = SimpleValidator<K> | ValidatorFunction;

type SimpleValidator<ValidatorKey> = [ValidatorKey] | [ValidatorKey, any[]];

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

    /* tslint:disable-next-line:cyclomatic-complexity */
    public validate(input: any): ValidationResult {
        const errors: ValidationError[] = [];

        for (const [key, validators] of Object.entries(this.rules)) {
            const isOptional = this.isOptional(validators);
            const value = input[key];

            if (!value && isOptional) {
                continue;
            }

            for (const validator of validators) {
                const [fn, args] = this.unpackRule(validator);
                const possibleError = fn(key, value, input, ...args);
                if (possibleError) {
                    errors.push(possibleError);
                }
            }
        }
        return [errors.length === 0, errors];
    }

    private isOptional(validators: Array<Validator<ValidatorKey>>): boolean {
        return validators.some(validator => {
            if (typeof validator === "function") {
                return false;
            }
            return validator[0] === "optional";
        });
    }

    private unpackRule(
        validator: Validator<ValidatorKey>,
    ): [ValidatorFunction, any[]] {
        let fn: ValidatorFunction;
        let args: any[] = [];
        if (typeof validator === "function") {
            fn = validator;
        } else {
            const name = validator[0];
            fn = DEFAULT_VALIDATORS[name];
            if (validator.length === 2) {
                args = validator[1] as any[];
            }
        }
        return [fn, args];
    }
}

const DEFAULT_VALIDATORS: DefaultValidators = {
    optional: () => undefined,

    isArray: (key, value) => {
        return !Array.isArray(value)
            ? {
                key,
                message: `${key} must be an Array`,
                validator: "isArray",
            }
            : undefined;
    },

    isString: (key, value) => {
        return typeof value !== "string"
            ? {
                key,
                message: `${key} must be a string`,
                validator: "isString",
            }
            : undefined;
    },
};
