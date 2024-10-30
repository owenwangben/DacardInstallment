import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { QueryUnauthorized_ITEM } from 'src/app/shared/services/sinopac/unauthorized.models';
import { AuthHelper, UnauthorizedService } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-unauthorized-txn',
    templateUrl: './unauthorized-txn.component.html',
    styleUrls: ['./unauthorized-txn.component.scss'],
})
export class UnauthorizedTxnComponent implements OnInit {
    private readonly app = new AppWrapper();
    // 未核准交易資料
    public items: QueryUnauthorized_ITEM[];
    // 回覆資料
    public checkItem: QueryUnauthorized_ITEM;
    // 彈窗燈箱狀態
    public messageBox: boolean = false;
    // 條款燈箱狀態
    public agreementBox: boolean = false;
    // 頁面步驟
    public selectedIndex: number = 0;
    // 是否同意注意事項
    public agreeSelfTrade: boolean = false;
    // 是否詳閱注意事項
    public agreeContract: boolean = false;
    // 是否閱畢注意事項
    public disable: boolean = false;
    // 檢測注意事項是否到底
    public termsLoaded: boolean = false;
    // 錯誤訊息燈箱狀態
    public errorMessageBox: boolean = false;
    // 錯誤訊息
    public errorMessageContent: string = '';
    // 回覆訊息
    public resultMessage: string = '';
    // 回覆狀態
    public resultStatus: boolean = false;

    constructor(
        private unauthorizedService: UnauthorizedService,
        private router: Router,
        private cdRef: ChangeDetectorRef
    ) {}

    public async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('未核准交易');
        await this.queryUnauthorized();
    }

    // 查詢未核准交易資料
    public async queryUnauthorized() {
        let queryUnauthorizedResp =
            await this.unauthorizedService.QueryUnauthorized({
                ID: AuthHelper.CustomerId,
            });
        if (queryUnauthorizedResp.ResultCode !== '00') {
            this.items = [];
            this.errorLightBox();
        } else {
            this.items = queryUnauthorizedResp.Result.Items || [];
            if (this.items.length > 0) this.items[0].ExpandStatus = true;
        }
    }

    // 顯示錯誤訊息燈箱
    public errorLightBox(): void {
        this.errorMessageContent =
            '系統維護中，請稍後再試，<br />或請洽本行客服專線，謝謝。';
        this.resultStatus = false;
        this.errorMessageBox = true;
        this.messageBox = false;
    }

    // 送出本人or非本人交易
    public async submit(selfTradeConfirm: boolean) {
        if (selfTradeConfirm && !this.agreeSelfTrade) return;
        let req = {
            ID: AuthHelper.CustomerId,
            EventID: this.checkItem.EventID,
            DecisionAuthorizationCode: this.checkItem.DecisionAuthorizationCode,
            SelfTradeConfirm: selfTradeConfirm,
        };
        let unauthorizedConfirmResp =
            await this.unauthorizedService.UnauthorizedConfirm(req);
        if (unauthorizedConfirmResp.ResultCode !== '00') {
            if (unauthorizedConfirmResp.ResultCode == '01') {
                this.resultMessage = '交易已超過回覆時限！';
                this.selectedIndex = 2;
            } else {
                this.errorLightBox();
            }
            return;
        }
        if (unauthorizedConfirmResp.Result.ResponseCode !== '00') {
            switch (unauthorizedConfirmResp.Result.ResponseCode) {
                case 'N1':
                    this.resultMessage = '交易已超過回覆時限！';
                    break;
                case 'N2':
                    this.resultMessage = '此編號已處理完成';
                    break;
                default:
                    this.resultMessage =
                        '系統維護中，請稍後再試，或請洽本行客服專線，謝謝。';
                    break;
            }
            this.selectedIndex = 2;
            return;
        }
        if (!selfTradeConfirm) {
            this.resultMessage =
                '已收到確認為非本人交易的回覆，請您速洽客服專線(02)2528-7776，與客服聯絡處理，謝謝。';
            this.selectedIndex = 2;
        } else {
            this.resultStatus = true;
            this.errorMessageBox = true;
            this.errorMessageContent = '已開放刷卡，可於3分鐘後重新刷卡。';
        }
    }

    // Item展開狀態
    public accrodionExpand(index) {
        this.items[index].ExpandStatus = !this.items[index].ExpandStatus;
    }

    // 回信用卡頁面
    public backToCardManage() {
        this.app.routeByBillID({ billID: 'f5ae6e8a-5b67-4bfa-8f76-c156531d4246', closeWeb: true });
    }

    // 顯示非本人交易燈箱
    public unAuthorizedMessage(index) {
        this.checkItem = this.items[index];
        this.messageBox = true;
    }

    // 關閉非本人交易燈箱
    public closeMessageBox() {
        this.checkItem = {} as QueryUnauthorized_ITEM;
        this.messageBox = false;
    }

    // 切換步驟至頂
    public scrollTop() {
        window.scroll(0, 0);
    }

    // 下一步同意注意事項
    public nextStep(index?: number) {
        if (index !== undefined) this.checkItem = this.items[index];
        this.selectedIndex = 1;
    }

    // 回到未核准交易查詢頁
    public async backToPevStep(reload?: boolean) {
        this.checkItem = {} as QueryUnauthorized_ITEM;
        this.selectedIndex = 0;
        this.agreementBox = false;
        this.messageBox = false;
        this.errorMessageBox = false;
        this.agreeSelfTrade = false;
        this.agreeContract = false;
        this.termsLoaded = false;
        this.resultStatus = false;
        if (reload) await this.queryUnauthorized();
    }

    // 顯示注意事項
    public showAgreement() {
        if (!this.agreeSelfTrade) {
            this.agreementBox = true;
        } else {
            this.agreeSelfTrade = false;
            this.agreeContract = false;
            this.termsLoaded = false;
        }
    }

    // 隱藏注意事項
    public hideAgreement(agree) {
        if (this.agreeContract && agree) {
            this.agreeSelfTrade = true;
        } else {
            this.agreeSelfTrade = false;
            this.agreeContract = false;
            this.termsLoaded = false;
        }
        this.agreementBox = false;
    }

    // 檢查同意事項是否拉到底
    public checkDisable(): void {
        if (this.agreementBox) {
            const domClientHeight =
                document.getElementById('terms_outer').clientHeight; // div高度
            const domScrollHeight =
                document.getElementById('terms_inner').scrollHeight; // dom 包含scroll總高
            const isScrollbarVisible = domScrollHeight > domClientHeight;
            this.disable = isScrollbarVisible;
            this.cdRef.detectChanges();
            this.termsLoaded = true;
        }
    }

    public ngAfterViewChecked(): void {
        if (!this.termsLoaded) this.checkDisable();
    }

    // 同意事項scroller狀態
    public changeState(state: boolean) {
        this.disable = !state;
    }

    // 呼叫客服中心
    public callCustomerServer() {
        this.errorMessageBox = false;
        this.app.showCustomerService();
    }
}
