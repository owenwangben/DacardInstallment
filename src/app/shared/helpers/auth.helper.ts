export default class AuthHelper {
    static storeAuthData(authData: AuthData) {
        sessionStorage.setItem('AuthHelper.WebToken', authData.Token);
        sessionStorage.setItem('AuthHelper.TokenExpiredAt', authData.TokenExpiredAt);
        sessionStorage.setItem('AuthHelper.CustomerId', authData.CustomerId);
    }

    static set AppToken(value: string) {
        sessionStorage.setItem('AuthHelper.AppToken', value);
    }
    static get AppToken(): string {
        return sessionStorage.getItem('AuthHelper.AppToken');
    }
    static get WebToken(): string {
        return sessionStorage.getItem('AuthHelper.WebToken');
    }
    static get TokenExpiredAt(): string {
        return sessionStorage.getItem('AuthHelper.TokenExpiredAt');
    }
    static get CustomerId(): string {
        return sessionStorage.getItem('AuthHelper.CustomerId');
    }
    static set PairedWatch(value: string) {
        sessionStorage.setItem('AuthHelper.PairedWatch', value);
    }
    static get PairedWatch(): string {
        return sessionStorage.getItem('AuthHelper.PairedWatch');
    }
}

export interface AuthData {
    Token: string;
    TokenExpiredAt: string;
    CustomerId: string;
}
