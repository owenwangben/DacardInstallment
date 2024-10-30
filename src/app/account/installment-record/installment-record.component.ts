import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { StmtInstallmentApplyRecord_ITEM, UnsettledInstallmentRecordItem } from 'src/app/shared/services/sinopac/finance.models';
import { FinanceService } from 'src/app/shared/services/sinopac/finance.service';
import { AuthHelper } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-installment-record',
    templateUrl: './installment-record.component.html',
    styleUrls: ['./installment-record.component.scss']
})
export class InstallmentRecordComponent implements OnInit {
    /** 控制頁面步驟 */
    selectedIndex = 0;
    /** 用於未登入身分檢查 */
    public readonly app = new AppWrapper();
    /** 身分證 */
    idNumber: string;
    /** 分期未到期總額 */
    totalAmount: number = 0;
    /** 未到期清單 */
    unsettledInstallmentRecordList: UnsettledInstallmentRecordItem[] = []
    /** 帳單分期申請結果清單 */
    stmtInstallmentApplyRecordList: StmtInstallmentApplyRecord_ITEM[] = []
    /** 頁簽切換控制 */
    pageControl: string = '未到期';
    /** 注意事項燈箱 */
    lightboxstatus: boolean = false;
    /** 未分期明細資料 */
    detailItem: UnsettledInstallmentRecordItem;
    constructor(
        private route: ActivatedRoute,
        private financeService: FinanceService,
    ) { 
        this.route.queryParams.subscribe(params => {
            if (+params.type == 2) 
                this.pageControl = '帳單分期申請紀錄';
        });
    }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('分期查詢');
        this.idNumber = AuthHelper.CustomerId;
        const Response = await this.financeService.UnsettledInstallmentRecord({ ID: this.idNumber })
        if (Response.ResultCode === "00") {
            this.totalAmount = Response.Result?.TotalAmount;
            this.unsettledInstallmentRecordList = Response.Result?.Items;
            // 將資料依據日期由近到遠排列
            this.unsettledInstallmentRecordList.sort( (a,b) => {
                const dateA = new Date(parseInt(a.TXDATE.slice(0, 4)), parseInt(a.TXDATE.slice(4, 6)) - 1, parseInt(a.TXDATE.slice(6, 8))).getTime();
                const dateB = new Date(parseInt(b.TXDATE.slice(0, 4)), parseInt(b.TXDATE.slice(4, 6)) - 1, parseInt(b.TXDATE.slice(6, 8))).getTime();
                return dateB - dateA;
            })
            this.unsettledInstallmentRecordList.forEach(e => {
                e.TXDATE = e.TXDATE.replace(/(\d{4})(\d{2})(\d{2})/, "$1/$2/$3");
                if (e.CARD_DESC === ("" || null || undefined)) {
                    e.CARD_DESC = "";
                }
            })
        }
        const Resp = await this.financeService.StmtInstallmentApplyRecord({ ID: this.idNumber, BeginDate: "", EndDate: "" })
        if (Resp.ResultCode = "00") {
            this.stmtInstallmentApplyRecordList = Resp.Result?.Items;
            // 將資料依據日期由近到遠排列
            this.stmtInstallmentApplyRecordList.sort( (a,b) => {
                const dateA = new Date(a.ApplyDate).getTime();
                const dateB = new Date(b.ApplyDate).getTime();
                return dateB - dateA
            })
            this.stmtInstallmentApplyRecordList.forEach(e => {
                switch (e.Status) {
                    case "申請中":
                        e.StatusUrl = "assets/images/icon/icon-info-blue.svg"
                        return;
                    case "成功":
                        e.StatusUrl = "assets/images/icon/icon-check-green.svg"
                        return;
                    case "失敗":
                        e.StatusUrl = "assets/images/icon/icon-fail-gray.svg"
                        return;
                }
            })
        }
        window.scrollTo(0, 0);
    }
    /** 切換頁面(未到期/帳單分期申請紀錄) */
    changePage(page: string) {
        this.pageControl = page;
    }
    /** 開啟注意事項燈箱 */
    lightBoxControl(status: boolean) {
        this.lightboxstatus = status;
        document.body.classList.toggle('scroll-fixed', status);
    }
    /** 打開未到期明細 */
    openDetail(item: UnsettledInstallmentRecordItem) {
        this.app.initHeaderBack('未到期明細');
        this.detailItem = item;
        this.selectedIndex = 1;
    }
    /** 關閉未到期明細 */
    closeDetail() {
        this.app.initHeaderBack('分期查詢');
        this.selectedIndex = 0;
    }
}
