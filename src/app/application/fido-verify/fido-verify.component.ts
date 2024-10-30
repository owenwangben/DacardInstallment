import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import {
    dataTranslateHelper,
    FidoService,
    ServiceHelper,
} from 'src/app/shared/shared.module';

enum FidoVerifyResult {
    /** 成功 */
    success = 1,
    /** 失敗 */
    fail = 2,
    /** 取消 */
    cancel = 3,
}
@Component({
    selector: 'app-fido-verify',
    templateUrl: './fido-verify.component.html',
    styleUrls: ['./fido-verify.component.scss'],
})
export class FidoVerifyComponent implements OnInit, OnDestroy {
    private _destroy$ = new Subject<any>();
    /** 強制倒數計時器 */
    forceCountDown: any;
    app = new AppWrapper();
    /** 交易識別碼 */
    tractionId: string;
    /** 是否有金額 */
    haveAmount: boolean = true;
    /** 非本人交易畫面 */
    isNotMyself: boolean = false;
    /** 幣別 */
    currency: string;
    /** 金額 */
    amount: string;
    /** 卡別 */
    cardType: string = '確認中';
    /** 卡號 */
    CardNoLast4: string = '';
    /** 雙按鈕燈箱 */
    twoBtnBox: boolean = false;
    /** 單按鈕燈箱 */
    oneBtnBox: boolean = false;
    oneData: any;
    twoData: any;
    /** 驗證失敗次數 */
    failCount: number = 0;
    /** 驗證ID不一致*/
    NotSameID: boolean = false;
    /** 幣別代碼 */
    currencyCode: string;
    /** 是否逾時 */
    isTimeOut: boolean = false;
    /** 是否已驗證過 */
    isReplied: boolean = false;

    public constructor(
        private route: ActivatedRoute,
        private fidoService: FidoService,
        private zone: NgZone
    ) {}

    async ngOnInit() {
        this.app.initHeaderBackWithCustomerService('交易驗證');
        ServiceHelper.SessionId = (await this.app.getDeviceUUID()) || '';
        await this.getData();
        this.getFidoVerifyResult();
    }

    /** 取得資料 */
    async getData() {
        this.route.queryParams.subscribe((params) => {
            this.tractionId = params.TractionId;
        });
        const response = await this.fidoService.QueryVerifiyRecord({
            DeviceId: ServiceHelper.SessionId,
            TractionId: this.tractionId,
        });
        if (ServiceHelper.ifSuccess(response, false)) {
            const item = response.Result.Items.find(
                (x) => x.TractionId === this.tractionId
            );
            if (item) {
                if (
                    item?.Amt &&
                    item?.Amt !== '0' &&
                    item.Type !== '驗證卡號' &&
                    item.Type !== '純綁卡'
                ) {
                    this.haveAmount = true;
                    this.amount = item.Amt.replace(/,/g, '');
                    this.currency = item.CurrencyName + item.CurrencyCode;
                    this.currencyCode = item.CurrencyCode;
                } else {
                    this.haveAmount = false;
                }
                this.cardType = item.CardType;
                //取item.CardNoLast4 後四碼
                this.CardNoLast4 = item.CardNoLast4?.slice(-4);
                if (item?.VerifyResult && item?.AuthType) {
                    this.isReplied = true;
                } else if (item?.IsTimeout) {
                    this.isTimeOut = true;
                }
            } else {
                this.NotSameID = true;
            }
        } else {
            this.NotSameID = true;
        }
    }

    /** 非本人交易檢查 */
    notMelfCheck() {
        this.twoBtnBox = true;
        this.twoData = {
            id: 'notMelfCheck',
            title: '非本人交易!!',
            content:
                '因攸關用卡安全，<br />請您再次確認是否為本人交易?<br />(確認資料一經送出，無法更正)',
            btn1: '非本人交易',
            btn2: '是本人交易',
        };
    }

    /** 非本人交易 */
    async notMyself() {
        this.isNotMyself = true;
        this.twoBtnBox = false;
        await this.verifiyComplete(FidoVerifyResult.fail, 2);
    }

    /** 本人交易 */
    submit() {
        this.fidoVerify();
    }

    // 3D刷卡Fido交易驗證
    public async fidoVerify() {
        this.app.fidoVerify({ id: 'fidoVerify' });
    }

    /** 取得驗證結果 */
    getFidoVerifyResult() {
        this.app.dataCallackEvent.subscribe((event) => {
            if (event.id === 'fidoVerify') {
                let data = event.data as any;
                data = dataTranslateHelper.dataTranslate(data);
                if (data?.fido_result === '1') {
                    this.zone.run(() => {
                        this.oneBtnBox = true;
                        this.oneData = {
                            id: 'verifySuccess',
                            title: '交易驗證成功',
                            content: '您已完成驗證，請回到原交易頁面。',
                            btn: '確　定',
                        };
                    });
                    this.verifiyComplete(FidoVerifyResult.success, 1);
                } else {
                    if (data?.error_code === '103') {
                        this.verifiyComplete(FidoVerifyResult.cancel, 1);
                    } else {
                        this.verifiyComplete(FidoVerifyResult.fail, 1);
                    }
                }
            }
        });
    }

    /** 驗證成功 */
    async verifiyComplete(result: FidoVerifyResult, verifiyComplete: number) {
        const response = await this.fidoService.VerifiyComplete({
            DeviceId: ServiceHelper.SessionId,
            VerifyResult: result,
            TractionId: this.tractionId,
            ConfirmType: verifiyComplete,
        });
    }

    /** 單按鈕click */
    oneBtn() {
        if (this.oneData?.id === 'verifySuccess') {
            this.goApp();
        } else {
            this.oneBtnBox = false;
        }
    }

    /** 雙按鈕click1 */
    twoBtn1() {
        if (this.twoData?.id === 'notMelfCheck') {
            this.notMyself();
        } else {
            this.goHistoryPush();
        }
    }

    /** 雙按鈕click2 */
    twoBtn2() {
        if (this.twoData?.id === 'notMelfCheck') {
            this.twoBtnBox = false;
        } else {
            this.goCustomerService();
        }
    }

    /** 取消 */
    cancel() {
        this.goHistoryPush();
    }

    /** 聯絡客服 */
    goCustomerService() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        this.app.showCustomerService();
    }

    /** 信用卡頁 */
    goCard() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        //(信用卡總覽)
        this.app.routeByBillID({
            billID: 'a6f91d85-b576-4e98-9ac4-affca8aba753',
            closeWeb: true,
        });
    }

    /** 登入頁 */
    goLogin() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        //切換使用者
        this.app.routeByBillID({
            billID: '39F8DED8-F8E9-4D09-B68E-EA1D5466777D',
            closeWeb: true,
        });
    }

    /** 歷史推播訊息 */
    goHistoryPush() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        this.app.routeByBillID({
            billID: 'B87C4EEA-B291-49FC-A6B7-E3411730BB62',
            closeWeb: true,
        });
    }

    /** 快速登入設定 */
    goQuloginSet() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        this.app.routeByBillID({
            billID: 'D1A12239-C8E3-460F-B6CC-1DC98C8D5149',
            closeWeb: true,
        });
    }

    /** APP首頁 */
    goApp() {
        this.oneBtnBox = false;
        this.twoBtnBox = false;
        this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }

    ngOnDestroy() {
        if (this.forceCountDown) {
            clearInterval(this.forceCountDown);
        }
        this._destroy$.next(null);
        this._destroy$.complete();
    }
}
