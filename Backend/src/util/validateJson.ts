interface JsonValidator {
    required: boolean;
    type: string;
}

const validateJsonBody = (body: any, schema: { [key: string]: JsonValidator }) => {
    for (let key in Object.keys(schema)) {
        console.log(schema)
        if (schema[key].required && !body.hasOwnProperty(key)) {
            return false;
        }

        if (schema[key].type !== 'array' && typeof body[key] !== schema[key].type) { 
            return false;
        }

        if (schema[key].type === 'array' && !Array.isArray(body[key])) {
            return false;
        }   
    }
    return true;
};

export { validateJsonBody, JsonValidator };