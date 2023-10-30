interface JsonValidator {
    required: boolean;
    type: string;
}

interface JsonValidatorResponse {
    valid: boolean;
    missing?: string[];
    invalid?: string[];
}

const validateJsonBody = (body: any, schema: { [key: string]: JsonValidator }) => {
    let missing: string[] = [];
    let invalid: string[] = [];
    const keys = Object.keys(schema);
    missing = keys.filter((key) => schema[key].required && (body[key] === null || body[key] === undefined));
    invalid = keys.filter((key) => {
        const value = body[key] ?? null;
        if (value === null) return false;
    
        return schema[key].type === 'array' ? !Array.isArray(value) : typeof value !== schema[key].type;
    });

    return {
        valid: missing.length === 0 && invalid.length === 0,
        missing: missing.length > 0 ? missing : undefined,
        invalid: invalid.length > 0 ? invalid : undefined
    } as JsonValidatorResponse;
};

export { validateJsonBody, JsonValidatorResponse, JsonValidator };