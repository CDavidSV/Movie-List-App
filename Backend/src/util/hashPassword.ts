import SHA256 from 'crypto-js/sha256';

interface HashResult {
    hashedPassword: string;
    salt: string;
}

const generateRandomSalt = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let salt = '';
    for (let i = 0; i < 16; i++) {
        const random = Math.floor(Math.random() * characters.length);
        salt += characters[random];
    }

    return salt;
};

const hashPassword = (password: string): HashResult => {
    const salt = generateRandomSalt();
    
    const hashedPassword = SHA256(`${password}${salt}`).toString();

    return { hashedPassword, salt } as HashResult;
};

export default hashPassword;