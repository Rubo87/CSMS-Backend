import jwt from 'jsonwebtoken';

export const jwtTokens = ({ id, username, email }) => {
    const user = { id, username, email };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '20s' // in reality will be 15 minutes, more common 
    });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '5m' // in reality will be 14 days, more common 
    });

    return({
        accessToken,
        refreshToken
    });
}