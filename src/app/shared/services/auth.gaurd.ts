import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthHelper, ServiceHelper, SharedService } from '../shared.module';
import { AuthService } from './sinopac/auth.service';
import AlertHelper from '../helpers/alert.helper';

@Injectable()
export class AuthGuard implements CanActivate {
    public constructor(private authService: AuthService, private sharedService: SharedService) {}

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        if (!!state.url && await this.checkSuspend(state.url)) {
            return false;
        }

        const app = new AppWrapper();
        const LoginData = await app.getLoginData();
        AuthHelper.AppToken = LoginData.token || '';
        // console.log('Assigned Token:', AuthHelper.AppToken);
        AuthHelper.PairedWatch = Number(LoginData.paired_watch) === 1 ? "Y" : "N";
        // console.log('Assigned PairedWatch:', AuthHelper.PairedWatch);
        ServiceHelper.SessionId = await app.getDeviceUUID() || '';
        // console.log('Assigned DeviceId:', ServiceHelper.SessionId);

        if (AuthHelper.AppToken) {
            const response = await this.authService.verifyToken({ AppToken: AuthHelper.AppToken, WebToken: AuthHelper.WebToken });
            // console.log('AuthGuard', response);
            if (ServiceHelper.ifSuccess(response)) {
                AuthHelper.storeAuthData({
                    Token: response.Result.NewToken,
                    TokenExpiredAt: response.Result.TokenExpiredAt,
                    CustomerId: response.Result.CustomerId
                });
                return true;
            }
        } else {
            app.showMsgDialog({ id: 'AuthGuard', title: '發生錯誤', msg: '無法取得AppToken' });
        }
		return false;
	}

    // 是否為暫停期間的功能
    private async checkSuspend(url: string): Promise<boolean> {
        try {
            const result = await this.sharedService.suspendCheck({ Url: url.split("?")[0] });
            if (result.ResultCode == '01') {
                AlertHelper.showErrorAndExitWebView(result.ResultMessage);
                return true;
            }
        } catch (error) {
            console.log(error);
        }
        return false;
    }
}
