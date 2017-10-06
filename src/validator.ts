interface RuleSet<K> {
    [key: string]: Array<SimpleValidator<K> | ValidatorFunction>;
}

type SimpleValidator<ValidatorKey> = [ValidatorKey] | [ValidatorKey, any[]];

type ValidatorFunction = (
    key: string,
    ...args: any[]
) => undefined | ValidationError;

interface ValidationError {
    key: string;
    validator: string;
    message: string;
}

type ValidationResult = [boolean, ValidationError[]];

export class ConfigValidator<K> {
    private rules: RuleSet<K>;

    constructor(rules: RuleSet<K>) {
        this.rules = rules;
    }

    public validate(input: object): ValidationResult {
        return [true, []];
    }
}
