import jwt from "jsonwebtoken"

function generateToken(payload: any, expirationDelta: number, refresh: boolean = false) {
    let key = process.env.ACCESS_TOKEN_KEY as string
    if (refresh) key = process.env.REFRESH_TOKEN_KEY as string

    return jwt.sign(payload, key as string, { expiresIn: expirationDelta })
}

export default generateToken