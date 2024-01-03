interface User {
    id: string;
    sessionId: string;
}

interface APIResponse<T> {
    status: string;
    message: string;
    responseData?: T;
}

export { 
    User,
    APIResponse
};