import { EventEmitter } from "@angular/core";
import { environment } from "src/environments/environment";
import { AppHelper } from "../shared.module";
import Swal from "sweetalert2";
import { Timeout } from "../timeout";
import { GeneralSensorsTrack } from "../services/sensorsdata";

interface IAppWrapper {
    //取得手機Device ID
    getDeviceUUID(): Promise<string>;
	//顯示指定的html Dialog(只有確認)
	showHtmlDialog(params: ShowHtmlDialogParams): void;
	//顯示指定的html Dialog(有確認及取消)
	showHtmlSelDialog(params: ShowHtmlSelDialogParams): void;
    //顯示message Dialog(只有確認)
    showMsgDialog(params: ShowMsgDialogParams): void;
    //顯示Message Dialog(有確認及取消)
    showMsgSelDialog(params: ShowMsgSelDialogParams): void;
    //依billID轉跳到指定頁
    routeByBillID(params: RouteByBillIDParams): void;
    //取得登入資訊
    getLoginData(): Promise<LoginData>;
    //取得登入狀態
    isLogin(): Promise<boolean>;
    //取得登入狀態 false則跳出登入視窗
    checkLogin(): Promise<boolean>;
    //關閉webview
    exitWeb(): void;
	//關閉webview並回到首頁
	exitWebToHome(params: ExitWebToHomeParams);
    //(iOS)取得Wallet中信用卡狀態
    getPassStatus(cardNoSuffixs: string): Promise<Array<PassStatusData>>;
    //(iOS)Apple Pay加卡
	applePayAddCard(params: ApplePayAddCardParams): Promise<boolean>;
    //掃描身分證正面
    scanPersonID(id: string): void;
    //掃描信用卡
    scanCreditCard(id: string): void;
    //3D FIDO 驗證
    fidoVerify(params: FidoVerifyParams): void;
    //設定header樣式(非首頁的header)
    initHeaderBack(title: string): void;
    //設定header樣式(首頁header)
    initHeaderMenu(title: string): void;
    //設定header樣式(上一頁+掃QRcode)
    initHeaderBackWithScan(title: string): void;
    //設定header樣式(上一頁+客服)
    initHeaderBackWithCustomerService(title: string): void;
    //呼叫聯絡客服
	showCustomerService(): void;
}

export class AppWrapper implements IAppWrapper {
    public readonly dialogCallackEvent = new EventEmitter<IdActionDataCallbackParams>();
    public readonly dataCallackEvent = new EventEmitter<IdDataCallbackParams>();
	public readonly addCardFinishCallackEvent = new EventEmitter<ActionDataCallbackParams>();
    private app: IAppWrapper;
    private web = new WebWrapper();

    private showError(e: Error): Promise<any> {
        return Swal.fire({
            html: 'Error:<br>' + e.message + '<br>Stack:<br>' + e.stack, title: '發生錯誤', icon: 'error',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }

    private async dialogCallBack(id: string, action: number, data: string) {
        try { this.dialogCallackEvent.emit({ id, action, data }); } catch(e) { await this.showError(e); throw e; }
    }

    private async dataCallBack(id: string, data: string) {
        try { this.dataCallackEvent.emit({ id, data }); } catch(e) { await this.showError(e); throw e; }
    }

	private async addCardFinishCallBack(action: number, data: string) {
        try { this.addCardFinishCallackEvent.emit({ action, data }); } catch(e) { await this.showError(e); throw e; }
    }

    public constructor() {
        window['AppWrapper'] = this;
        if (AppHelper.Is_Android) { this.app = new AndroidAppWrapper(); }
        else if (AppHelper.Is_iOS) { this.app = new iOSAppWrapper(); }
        else { this.app = new WebWrapper(); }
    }

    public async getDeviceUUID(): Promise<string> {
        try { return this.app.getDeviceUUID(); } catch(e) { await this.showError(e); throw e; }
    }

	public async showHtmlDialog(params: ShowHtmlDialogParams) {
        if (!params.btnOK) params.btnOK = '確定';
        // if (!params.url) params.url = '';
        // if (!params.htmlstr) params.htmlstr = '';
        // if (!params.data) params.data = '';
        // try { this.app.showHtmlDialog(params); } catch(e) { await this.showError(e); throw e; }
        this.web.showHtmlDialog(params);
	}

	public async showHtmlSelDialog(params: ShowHtmlSelDialogParams) {
        if (!params.btnNO) params.btnNO = '取消';
        if (!params.btnOK) params.btnOK = '確定';
        // if (!params.url) params.url = '';
        // if (!params.htmlstr) params.htmlstr = '';
        // if (!params.data) params.data = '';
        // try { this.app.showHtmlSelDialog(params); } catch(e) { await this.showError(e); throw e; }
        this.web.showHtmlSelDialog(params);
	}

    public showMsgDialog(params: ShowMsgDialogParams) {
        if (!params.btnStr) params.btnStr = '確定';
        // if (!params.data) params.data = '';
        // try { this.app.showMsgDialog(params); } catch(e) { this.showError(e); throw e; }
        this.web.showMsgDialog(params);
    }

    public showMsgSelDialog(params: ShowMsgSelDialogParams) {
        if (!params.btnNO) params.btnNO = '取消';
        if (!params.btnOK) params.btnOK = '確定';
        // if (!params.data) params.data = '';
        // try { this.app.showMsgSelDialog(params); } catch(e) { this.showError(e); throw e; }
        this.web.showMsgSelDialog(params);
    }

    public async routeByBillID(params: RouteByBillIDParams) {
        try { this.app.routeByBillID(params); } catch(e) { await this.showError(e); throw e; }
    }

    public async getLoginData(): Promise<LoginData> {
        try { return this.app.getLoginData(); } catch(e) { await this.showError(e); throw e; }
    }

    public async isLogin(): Promise<boolean> {
        try { return this.app.isLogin(); } catch(e) { await this.showError(e); throw e; }
    }

    public async checkLogin(): Promise<boolean> {
        try { return this.app.checkLogin(); } catch(e) { await this.showError(e); throw e; }
    }

    public async exitWeb() {
        try { this.app.exitWeb(); } catch(e) { await this.showError(e); throw e; }
    }

	public async exitWebToHome(params: ExitWebToHomeParams) {
        try { this.app.exitWebToHome(params); } catch(e) { await this.showError(e); throw e; }
	}

    public async getPassStatus(cardNoSuffixs: string): Promise<Array<PassStatusData>> {
        try { return await this.app.getPassStatus(cardNoSuffixs); } catch(e) { await this.showError(e); throw e; }
    }

    public async applePayAddCard(params: ApplePayAddCardParams): Promise<boolean> {
        try { return await this.app.applePayAddCard(params); } catch(e) { await this.showError(e); throw e; }
	}

    public async scanPersonID(id: string) {
        try { this.app.scanPersonID(id); } catch(e) { await this.showError(e); throw e; }
    }

    public async scanCreditCard(id: string) {
        try { this.app.scanCreditCard(id); } catch(e) { await this.showError(e); throw e; }
    }

    public async initHeaderBack(title: string) {
        try { this.app.initHeaderBack(title); } catch(e) { await this.showError(e); throw e; }
    }

    public async initHeaderMenu(title: string) {
        try { this.app.initHeaderMenu(title); } catch(e) { await this.showError(e); throw e; }
    }

    public async initHeaderBackWithScan(title: string) {
        try { this.app.initHeaderBackWithScan(title); } catch(e) { await this.showError(e); throw e; }
    }

    public async initHeaderBackWithCustomerService(title) {
        try { this.app.initHeaderBackWithCustomerService(title); } catch(e) { await this.showError(e); throw e; }
	}

	public async showCustomerService() {
        try { this.app.showCustomerService(); } catch(e) { await this.showError(e); throw e; }
	}

    public async fidoVerify(params: FidoVerifyParams) {
        try { this.app.fidoVerify(params); } catch(e) { await this.showError(e); throw e; }
    }
}

class AndroidAppWrapper implements IAppWrapper {
    public getDeviceUUID(): Promise<string> {
        return new Promise(resolve => resolve(window['APP'].getDeviceUUID()));
    }
	public showHtmlDialog(params: ShowHtmlDialogParams): void {
        window['APP'].showHtmlDialog(JSON.stringify(params))
	}
	public showHtmlSelDialog(params: ShowHtmlSelDialogParams): void {
        window['APP'].showHtmlSelDialog(JSON.stringify(params))
	}
    public showMsgDialog(params: ShowMsgDialogParams): void {
        window['APP'].showMsgDialog(JSON.stringify(params));
    }
    public showMsgSelDialog(params: ShowMsgSelDialogParams): void {
        window['APP'].showMsgSelDialog(JSON.stringify(params));
    }
    public routeByBillID(params: RouteByBillIDParams): void {
		window['APP'].routeByBillID(JSON.stringify(params));
    }
    public getLoginData(): Promise<LoginData> {
        return new Promise(resolve => resolve(JSON.parse(window['APP'].getLoginData())));
    }
    public isLogin(): Promise<boolean> {
        return new Promise(resolve => resolve(JSON.parse(window['APP'].isLogin())));
    }
    public checkLogin(): Promise<boolean> {
        return new Promise(resolve => resolve(JSON.parse(window['APP'].checkLogin())));
    }
    public exitWeb(): void {
        window['APP'].exitWeb();
	}
	public exitWebToHome(params: ExitWebToHomeParams) {
        window['APP'].exitWebToHome(JSON.stringify(params));
	}
    // this is for Apple only, Android does not have this funciton
    public getPassStatus(cardNoSuffixs: string): Promise<Array<PassStatusData>> {
        throw new Error('getPassStatus is not supported by Android!');
    }
    // this is for Apple only, Android does not have this funciton
	public applePayAddCard(params: ApplePayAddCardParams): Promise<boolean> {
        throw new Error('applePayAddCard is not supported by Android!');
	}
    public scanPersonID(id: string): void {
        window['APP'].scanPersonID(id);
    }
    public scanCreditCard(id: string): void {
        window['APP'].scanCreditCard(id);
    }
    public initHeaderBack(title: string): void {
        window['APP'].initHeaderBack(title);
    }
    public initHeaderMenu(title: string): void {
        window['APP'].initHeaderMenu(title);
    }
    public initHeaderBackWithScan(title: string): void {
        window['APP'].initHeaderBackWithScan(title);
    }
    public initHeaderBackWithCustomerService(title: string): void {
        window['APP'].initHeaderBackWithCustomerService(title);
    }
	public showCustomerService(): void {
        window['APP'].showCustomerService();
    }
    public fidoVerify(params: FidoVerifyParams): void {
        window['APP'].fidoVerify(JSON.stringify(params));
    }
}

class iOSAppWrapper implements IAppWrapper {
    // public constructor() {
    //     window['setupWebViewJavascriptBridge']((bridge: any) => {
    //         bridge.registerHandler("dialogCallBack", function (res: string) {
    //             // 轉換獲取的資料
    //             const { id, action, data } = JSON.parse(res);
    //             window['AppWrapper'].dialogCallBack(id, action, data);
    //         });
    //         bridge.registerHandler("dataCallBack", function (res: string) {
    //             // 轉換獲取的資料
    //             const { id, data } = JSON.parse(res);
    //             window['AppWrapper'].dataCallBack(id, data);
    //         });
	// 		bridge.registerHandler("addCardFinishCallBack", function (res: string) {
    //             // 轉換獲取的資料
    //             const { action, data } = JSON.parse(res);
    //             window['AppWrapper'].addCardFinishCallBack(action, data);
    //         });
    //     });
    // }

    // https://segmentfault.com/q/1010000015821554
    private callHandler(func: string, params: string): Promise<any> {
        return Timeout.wrap(new Promise(resolve => {
            window['setupWebViewJavascriptBridge']((bridge: any) => {
                bridge.callHandler(func, params, (response: any) => {
                    return resolve(response);
                });
            });
        }), 5000, 'bridge.callHandler timedout, func=' + func + ' and params=' + params);
    }

    // private setupWebViewJavascriptBridge(callback) {
    //     if (window['WebViewJavascriptBridge']) { return callback(window['WebViewJavascriptBridge']); }
    //     if (window['WVJBCallbacks']) { return window['WVJBCallbacks'].push(callback); }
    //     window['WVJBCallbacks'] = [callback];
    //     var WVJBIframe = document.createElement('iframe');
    //     WVJBIframe.style.display = 'none';
    //     WVJBIframe.src = 'https://__bridge_loaded__';
    //     document.documentElement.appendChild(WVJBIframe);
    //     setTimeout(function () { document.documentElement.removeChild(WVJBIframe) }, 0)
    // }

    public getDeviceUUID(): Promise<string> {
        return this.callHandler('getDeviceUUID', '');
    }
	public showHtmlDialog(params: ShowHtmlDialogParams): void {
        this.callHandler('showHtmlDialog', JSON.stringify(params));
	}
	public showHtmlSelDialog(params: ShowHtmlSelDialogParams): void {
        this.callHandler('showHtmlSelDialog', JSON.stringify(params));
	}
    public showMsgDialog(params: ShowMsgDialogParams): void {
        this.callHandler('showMsgDialog', JSON.stringify(params));
    }
    public showMsgSelDialog(params: ShowMsgSelDialogParams): void {
        this.callHandler('showMsgSelDialog', JSON.stringify(params));
    }
    public routeByBillID(params: RouteByBillIDParams): void {
		this.callHandler('routeByBillID', JSON.stringify(params));
    }
    public async getLoginData(): Promise<LoginData> {
        return JSON.parse(await this.callHandler('getLoginData', ''));
    }
    public async isLogin(): Promise<boolean> {
        return JSON.parse(await this.callHandler('isLogin', ''));
    }
    public async checkLogin(): Promise<boolean> {
        return JSON.parse(await this.callHandler('checkLogin', ''));
    }
    public exitWeb(): void {
        this.callHandler('exitWeb', '');
	}
	public exitWebToHome(params: ExitWebToHomeParams) {
		this.callHandler('exitWebToHome', JSON.stringify(params));
	}
    public async getPassStatus(cardNoSuffixs: string): Promise<Array<PassStatusData>> {
		const response = await this.callHandler('getPassStatus', cardNoSuffixs);
        return JSON.parse(response || '[]');
    }
	public applePayAddCard(params: ApplePayAddCardParams): Promise<boolean> {
		return this.callHandler('applePayAddCard', JSON.stringify(params));
	}
    public scanPersonID(id: string): void {
        this.callHandler('scanPersonID', id);
    }
    public scanCreditCard(id: string): void {
        this.callHandler('scanCreditCard', id);
    }
    public initHeaderBack(title: string): void {
        this.callHandler('initHeaderBack', title);
    }
    public initHeaderMenu(title: string): void {
        this.callHandler('initHeaderMenu', title);
    }
    public initHeaderBackWithScan(title: string): void {
        this.callHandler('initHeaderBackWithScan', title);
    }
    public initHeaderBackWithCustomerService(title: string): void {
        this.callHandler('initHeaderBackWithCustomerService', title);
    }
	public showCustomerService(): void {
        this.callHandler('showCustomerService', '');
    }
    public fidoVerify(params: FidoVerifyParams): void {
        this.callHandler('fidoVerify', JSON.stringify(params));
    }
}

class WebWrapper implements IAppWrapper {
    public getDeviceUUID(): Promise<string> {
        return new Promise(resolve => resolve('SinopacCawhoDevice'));
    }
	public async showHtmlDialog(params: ShowHtmlDialogParams): Promise<void> {
        var result = await Swal.fire({
            html: params.htmlstr, title: params.title, confirmButtonText: params.btnOK,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        window['AppWrapper'].dialogCallBack(params.id, result.isConfirmed ? 0 : 1, params.data);
	}
	public async showHtmlSelDialog(params: ShowHtmlSelDialogParams): Promise<void> {
        var result = await Swal.fire({
            html: params.htmlstr, title: params.title, showCancelButton: true,
            confirmButtonText: params.btnOK, cancelButtonText: params.btnNO,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        window['AppWrapper'].dialogCallBack(params.id, result.isConfirmed ? 0 : 1, params.data);
	}
    public async showMsgDialog(params: ShowMsgDialogParams): Promise<void> {
        var result = await Swal.fire({
            text: params.msg, title: params.title, confirmButtonText: params.btnStr,
            allowOutsideClick:params.allowOutsideClick ?? true,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        window['AppWrapper'].dialogCallBack(params.id, result.isConfirmed ? 0 : 1, params.data);
    }
    public async showMsgSelDialog(params: ShowMsgSelDialogParams): Promise<void> {
        var result = await Swal.fire({
            text: params.msg, title: params.title, showCancelButton: true,
            confirmButtonText: params.btnOK, cancelButtonText: params.btnNO,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        window['AppWrapper'].dialogCallBack(params.id, result.isConfirmed ? 0 : 1, params.data);
    }
    public routeByBillID(params: RouteByBillIDParams): void {
        Swal.fire({
            text: JSON.stringify(params), title: '切換APP功能', confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }
    public getLoginData(): Promise<LoginData> {
        return new Promise(resolve => resolve({ token: environment.appToken }));
    }
    public isLogin(): Promise<boolean> {
        return new Promise(resolve => resolve(true));
    }
    public checkLogin(): Promise<boolean> {
        return new Promise(resolve => resolve(true));
    }
    public exitWeb(): void {
        window.location.href = 'Home';
	}
    public exitWebToHome(params: ExitWebToHomeParams): void {
        window.location.href = 'Home';
	}
    public getPassStatus(cardNoSuffixs: string): Promise<Array<PassStatusData>> {
        return new Promise(resolve => resolve([{ PANS:'1234', DANS:'4321', device: 'iPhone', state: 0 }]));
    }
    public async applePayAddCard(params: ApplePayAddCardParams): Promise<boolean> {
		var result = await Swal.fire({
            text: JSON.stringify(params), title: 'Apple Pay加卡', showCancelButton: true, confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        window['AppWrapper'].addCardFinishCallBack(result.isConfirmed ? 0 : 1, '{"PANS":"1234","DANS":"4321","device":"iPhone","state":0}');
		return true;
	}
    public scanPersonID(id: string): void {
        window['AppWrapper'].dataCallBack(id, '{"name":"測試", "birthday_roc":"0710101", "issurance_date_roc":"0940701", "issurance_city":"北市", "issurance_type":1}');
    }
    public scanCreditCard(id: string): void {
        window['AppWrapper'].dataCallBack(id, '{"card_no":"4311123456784321", "holder_name":"持卡人姓名", "expire_date":"1024"}');
    }
    public initHeaderBack(title: string): void {
        document.title = title;
    }
    public initHeaderMenu(title: string): void {
        document.title = title;
    }
    public initHeaderBackWithCustomerService(title: string): void {
        document.title = title;
    }
    public initHeaderBackWithScan(title: string): void {
        document.title = title;
    }
	public showCustomerService(): void {
        Swal.fire({
            text: '聯絡客服', title: '聯絡客服', showCancelButton: true, confirmButtonText: '確定', cancelButtonText: '取消',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
              },
              hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }
    public fidoVerify(params: FidoVerifyParams): void {
        window['AppWrapper'].dataCallBack(params.id, '{"fido_result":"2", "error_code":"102"}');
    }
}

export interface IdActionDataCallbackParams {
    id: string;
    action: number;
    data: string;
}

export interface IdDataCallbackParams {
    id: string;
    data: string;
}

export interface ActionDataCallbackParams {
    action: number;
    data: string;
}

export interface ShowHtmlDialogParams {
    id: string;
    title: string;
	url?: string;
	htmlstr?: string;
    btnOK?: string;
    data?: string;
}

export interface ShowHtmlSelDialogParams {
    id: string;
    title: string;
	url?: string;
	htmlstr?: string;
    btnNO?: string;
    btnOK?: string;
    data?: string;
}

export interface ShowMsgDialogParams {
    id: string;
    title: string;
    msg: string;
    btnStr?: string;
    data?: string;
    allowOutsideClick?:boolean;
}

export interface ShowMsgSelDialogParams {
    id: string;
    title: string;
    msg: string;
    btnNO?: string;
    btnOK?: string;
    data?: string;
}

export interface LoginData {
    //登入token
    token: string;
    //會員類別: None, MMA, PayMember
    userType?: string;
    //登入方法: Password, Graphic, FingerPrint, FaceID
    loginMethod?: string;
    //是否有永豐銀行帳戶(IOS回應0/1，安卓回應true/false)
    has_sinopac_acct?: any;
    //是否有永豐信用卡(IOS回應0/1，安卓回應true/false)
    has_sinopac_card?: any;
    //身分證字號
    custID?: string;
    //手機號碼
    mobile?: string;
    //電子信箱地址
    email?: string;
	//是否為MMA
	is_mma?: boolean;
	//DMP mma user ID
	mma_user_id?: string;
	//是否有 Apple Watch
	paired_watch?: boolean;
}

export interface PassStatusData {
    PANS: string;
    DANS: string;
    device: string;
    state: number;
}

export interface ApplePayAddCardParams {
    //持卡人姓名
	cardHolderName: string;
    //卡片名稱
	cardName: string;
    //信用卡號
	cardNo: string;
}

export interface RouteByBillIDParams {
    //指定功能的billID, 交易明細_信用卡頁:3fbc9a94-7c5d-4915-a83e-fd06544b2a78
    //                    信用卡管理頁面:f5ae6e8a-5b67-4bfa-8f76-c156531d4246
    billID: string;
    //是否關閉目前的webview
    closeWeb: boolean;
}

export interface ExitWebToHomeParams {
	//用來指定回到首頁後是否要顯示登入dialog(如果已登入，給true也不會顯示)
	needLogin: boolean;
	//到了首頁登入後是否顯示快速登入設定詢問
	needQuickLogin: boolean;
}

export interface FidoVerifyParams {
    id: string;
}
