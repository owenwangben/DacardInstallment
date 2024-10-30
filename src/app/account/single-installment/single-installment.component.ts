import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { CustomDatePipe } from 'src/app/shared/pipes/customDate.pipe';
import { CreditCardResultSensorsTrack, CreditCardSensorsTrack } from 'src/app/shared/services/sensorsdata';
import { EasyCashCalcCycleFeeItem, GetInstallmentDataItem, GetInstallmentDataRs, InstallmentApplyCheckItem } from 'src/app/shared/services/sinopac/account.models';
import { GetAgreementInfoRs } from 'src/app/shared/services/sinopac/agreement.models';
import { AgreementCodes } from 'src/app/shared/services/sinopac/shared.model';
import { AccountService, AgreementService, AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-single-installment',
    templateUrl: './single-installment.component.html',
    styleUrls: ['./single-installment.component.scss'],
})
export class SingleInstallmentComponent implements OnInit {
    private readonly app = new AppWrapper();
    private idNumber = "";
    public sso = false;
    public selectedIndex = 0;
    public applyInstallmentAgreementData: GetAgreementInfoRs;
    public singleInstallmentNoticeAgreementData: GetAgreementInfoRs;
    public agreementCodes = [AgreementCodes.applyInstallmentAgreement, AgreementCodes.singleInstallmentNoticeAgreement];
    public installmentData: GetInstallmentDataRs;
    public installmentDetailItems: Array<InstallmentApplyCheckItem>;
    public installmentDetailItem: InstallmentApplyCheckItem;
    public amount = 0;
    public applyDate = new Date();
    public refNo = "";
    public errorMessage = ""
    public applyStatus = false;
    public applyInstallmentItem: GetInstallmentDataItem;
    public noInstallmentItemMsg = "";
    public EasyCashCalcCycleFeeResult = new Array<EasyCashCalcCycleFeeItem>({
        SEQ: "",
        MonthPayment: "",
        Interest: "",
        PrincipalAmount: "",
        IRR: ""
    });

    constructor(
        private accountService: AccountService,
        private agreementService: AgreementService,
        private route: ActivatedRoute,
        private modalService: SimpleModalService
    ) { }

    public async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('單筆消費分期');
        this.idNumber = await AuthHelper.CustomerId;
        await this.getInstallmentData();
        await this.getAgreementInfo();
    }

    public ngAfterViewInit() {
        $(':checkbox[name="agree"]').change(function () {
            let agree = $(this).filter(':checked').val();
            if (agree) {
                $(this).closest('div.iframe-box').siblings('div.button-group').find('button.btn--check').removeAttr("disabled")
            } else {
                $(this).closest('div.iframe-box').siblings('div.button-group').find('button.btn--check').prop("disabled", true);
            }
        });
    }

    async showRule (){
        let PrincipalAmountTotal = 0;
        let InterestTotal = 0;
        this.EasyCashCalcCycleFeeResult.forEach(element => { PrincipalAmountTotal += +element.PrincipalAmount.replace(",","") });
        this.EasyCashCalcCycleFeeResult.forEach(element => { InterestTotal += +element.Interest.replace(",","") });
        CreditCardSensorsTrack("CardStagingApply",true,PrincipalAmountTotal,InterestTotal);
        const agree = await this.modalService
        .addModal(NoticeDialogComponent, {
            Title: '信用卡單筆消費分期注意事項',
            Source: 'CAWHO',
            NoticeMatter: '永豐商業銀行單筆交易分期付款注意事項',
            NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
            color: urlColor.None,
        })
        .toPromise();
        if (agree) {
            CreditCardSensorsTrack("CardStagingNotice",true);
            this.selectedIndex=3;
        }
        else {
            CreditCardSensorsTrack("CardStagingNotice",false);
            this.reselect();
        }
    }

    // 重置勾選項目
    public reselect() {
        this.selectedIndex = 1;
        $(':checkbox[name="agree"]').each((i, e) => $(e).prop('checked', false).trigger('change'))
    }

    public scrollTop() {
        window.scroll(0, 0)
    }

    // 關閉網頁回到APP
    public backToPreviousButton(T?) {
        if(T === 'FinalCheck') {
            CreditCardResultSensorsTrack("CardStagingResult", true, this.amount, this.installmentDetailItem.Period, this.installmentDetailItem.Rate/100,
            +this.installmentDetailItem.FirstAmt.replace(",",""),  +this.EasyCashCalcCycleFeeResult[0].PrincipalAmount.replace(",",""), +this.EasyCashCalcCycleFeeResult[0].Interest.replace(",",""));
        }
        this.app.exitWeb();
    }

    // 取得合約注意事項
    public async getAgreementInfo() {
        try {
            for (let i = 0; i < this.agreementCodes.length; i++) {
                if (this.installmentData.IsSignedInstallmentAgreement && i == 0) continue
                const response = await this.agreementService.getAgreementInfo({ Title: this.agreementCodes[i], Source: "CAWHO" });
                if (ServiceHelper.ifSuccess(response, false)) {
                    switch (this.agreementCodes[i]) {
                        case "信用卡消費分期付款功能申請書":
                            this.applyInstallmentAgreementData = response.Result;
                            break
                        case "信用卡單筆消費分期注意事項":
                            this.singleInstallmentNoticeAgreementData = response.Result;
                            break
                        default:
                            break
                    }
                } else {
                    await this.showSweetAlertMessages(response.ResultMessage);
                    return;
                }
            }
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 寫入合約版號
    public async insertAgreementRecord(title) {
        try {
            await this.agreementService.insertAgreementRecord({
                ID: this.idNumber,
                Title: title == this.agreementCodes[0] ? this.applyInstallmentAgreementData.Title : this.singleInstallmentNoticeAgreementData.Title,
                Version: title == this.agreementCodes[0] ? this.applyInstallmentAgreementData.Version : this.singleInstallmentNoticeAgreementData.Version,
                Source: "CAWHO"
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    // 同意開啟單筆消費分期設定
    public async setInstallmentData() {
        try {
            const response = await this.accountService.setInstallmentAgreement({ ID: this.idNumber });
            if (ServiceHelper.ifSuccess(response, false)) {
                return;
            }
            await this.showSweetAlertMessages(response.ResultMessage);
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        return;
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    // 外開連結
    toExternalLink(link: string) {
        location.href = link;
    }

    // 同意信用卡消費分期付款功能申請書
    public agreeApplyInstallment() {
        this.setInstallmentData();
        this.insertAgreementRecord(this.agreementCodes[0]);
    }

    // 取得可申請分期之已請款交易
    public async getInstallmentData() {
        try {
            const response = await this.accountService.getInstallmentData({
                ID: this.idNumber,
                TransactionType: 0
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.installmentData = response.Result;
                var hideAgreeInstallmentBlock = this.installmentData.IsSignedInstallmentAgreement;
                if(!hideAgreeInstallmentBlock) {
                    const agree = await this.modalService
                    .addModal(NoticeDialogComponent, {
                        Title: '信用卡消費分期付款功能申請書',
                        Source: 'CAWHO',
                        NoticeMatter: '永豐商業銀行信用卡消費分期付款功能申請書',
                        NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                        color: urlColor.None,
                    })
                    .toPromise();
                    if (agree) {
                        CreditCardSensorsTrack("CardStagingAgreement",true);
                        this.agreeApplyInstallment();

                    }
                    else {
                        CreditCardSensorsTrack("CardStagingAgreement",false);
                        this.backToPreviousButton();
                    }
                }
                this.noInstallmentItemMsg = !this.installmentData?.CanApplyInstallment || this.installmentData?.Items.length <= 0 ? "您目前沒有符合可分期的交易。":"";
                return;
            }
            await this.showSweetAlertMessages(response.ResultMessage);
        }
        catch (error) {
            console.log(error);
            alert(error)
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        return;
    }

    // 驗證分期資料並取得各期利率資料
    public async installmentApplyCheck(item: GetInstallmentDataItem) {
        //如果已請過直接中斷執行
        if(item?.IsAlreadyInstallment) {return;}

        try {
            const response = await this.accountService.installmentApplyCheck({
                ID: this.idNumber,
                CardNumber: item.CardNumber,
                AuthCode: item.AuthCode,
                TxDate: new CustomDatePipe().transform(item.TransactionDate),
                DeDate: item?.DeDate ? new CustomDatePipe().transform(item.DeDate) : null,
                MerchantNo: item.MerchNumber,
                MCC: item.MCC,
                Amount: +item.Amount,
                Memo: item.Memo,
                FirstFlag: item.FirstFlag,
                IsTCTD: item.IsTCTD
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                CreditCardSensorsTrack("CardStagingConsumeType",true);
                this.installmentDetailItems = await response.Result.Items;
                this.applyInstallmentItem = { ...item };
                this.amount = +item.Amount;
                this.selectedIndex = await 1;
                return;
            }
            else {
                CreditCardSensorsTrack("CardStagingConsumeType",false);
            }
            await this.showSweetAlertMessages(response.ResultMessage);
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
            alert(error)
        }
        return;
    }

    // 申請單筆分期
    public async installmentApply() {
        try {
            const response = await this.accountService.installmentApply({
                ID: this.idNumber,
                IsTCTD: this.applyInstallmentItem.IsTCTD,
                Amount: this.amount,
                CardNumber: this.applyInstallmentItem.CardNumber,
                AuthCode: this.applyInstallmentItem.AuthCode,
                TransactionDate: new CustomDatePipe().transform(this.applyInstallmentItem.TransactionDate),
                DeDate: this.applyInstallmentItem?.DeDate ? new CustomDatePipe().transform(this.applyInstallmentItem.DeDate) : null,
                Memo: this.applyInstallmentItem.Memo,
                Period: this.installmentDetailItem.Period.toString(),
                Program: this.installmentDetailItem.Program,
                ProductCode: this.installmentDetailItem.ProductCode,
                Rate: this.installmentDetailItem.Rate.toString(),
                FirstAmt: this.installmentDetailItem.FirstAmt,
                SalRef: this.applyInstallmentItem.SalRef,
                Referrer: "",
                Verify_Method: "MMA",
                MCC: this.applyInstallmentItem?.MCC || "",
                TXCUR: this.applyInstallmentItem?.TXCUR || "",
                MerchArea: this.applyInstallmentItem?.MerchArea || ""
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                CreditCardSensorsTrack("CardStagingConfirm",true);
                this.refNo = response.Result.RefNo;
                this.applyStatus = true;
                this.insertAgreementRecord(this.agreementCodes[1])
            } else {
                CreditCardSensorsTrack("CardStagingConfirm",false);
                this.errorMessage = response.ResultMessage;
            }
            this.selectedIndex = 4;
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 取得分期試算表
    async getEasyCashCalcCycleFee(item: InstallmentApplyCheckItem) {
        try {
            const response = await this.accountService.easyCashCalcCycleFee({
                LoanAmt: this.amount,
                Period: item.Period,
                AnnRate: item.Rate,
                ProcessFee: +item.FirstAmt
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.EasyCashCalcCycleFeeResult = await response.Result.Items;
                this.installmentDetailItem = item;
                this.selectedIndex = await 2;
                CreditCardSensorsTrack("CardStagingNumber",true);
                return;
            }
            CreditCardSensorsTrack("CardStagingNumber",false);
            await this.showSweetAlertMessages(response.ResultMessage);
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        return;
    }

    public async showSweetAlertMessages(text: string) {
        let swal = Swal.fire({
            text: text, icon: 'error', confirmButtonText: '確定',
            allowOutsideClick: false,
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
        if ((await swal).isConfirmed) {
            this.backToPreviousButton();
        }
        return;
    }
}
