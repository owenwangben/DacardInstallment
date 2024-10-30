import { EasyCashCalcCycleFeeItem } from './../../shared/services/sinopac/account.models';
import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StmtInstallmentDataRs } from 'src/app/shared/services/sinopac/account.models';
import { AccountService, AgreementService, AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { GetAgreementInfoRs } from 'src/app/shared/services/sinopac/agreement.models';
import { AgreementCodes } from 'src/app/shared/services/sinopac/shared.model';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { CreditCardResultSensorsTrack, CreditCardSensorsTrack } from 'src/app/shared/services/sensorsdata';

@Component({
    selector: 'app-installment',
    templateUrl: './installment.component.html',
    styleUrls: ['./installment.component.scss']
})
export class InstallmentComponent implements AfterViewInit {
    private readonly app = new AppWrapper();
    selectedIndex = 0;
    sso = false;
    private idNumber = "";
    Period = 0;
    AnnRate = 0;
    ProcessFee = 0;
    installmentDataResult: StmtInstallmentDataRs = {} as StmtInstallmentDataRs;
    EasyCashCalcCycleFeeResult = new Array<EasyCashCalcCycleFeeItem>({
        SEQ: "",
        MonthPayment: "",
        Interest: "",
        PrincipalAmount: "",
        IRR: ""
    });
    applyDate = new Date();
    RefNo = "";
    errorMessage = ""
    applyStatus = false;
    applyInstallmentAgreementData: GetAgreementInfoRs;
    installmentNoticeAgreementData: GetAgreementInfoRs;
    agreementCodes = [AgreementCodes.applyInstallmentAgreement,AgreementCodes.installmentNoticeAgreement];
    /** 是否顯示不符合帳單分期資格訊息 */
    canapply = false;

    constructor(
        private accountService: AccountService,
        private agreementService: AgreementService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: SimpleModalService
    ) { }

    ngOnInit() {
        this.app.initHeaderBack('帳單分期');
        this.sso = this.route.snapshot.data.Sso;
        if (this.sso) {
            this.idNumber = AuthHelper.CustomerId;
            this.getStmtInstallmentData();
        }
    }

    ngAfterViewInit() {
        $(':checkbox[name="agree"]').change(function () {
            let agree = $(this).filter(':checked').val();
            if (agree) {
                $(this).closest('div.iframe-box').siblings('div.button-group').find('button.btn--check').removeAttr("disabled")
            } else {
                $(this).closest('div.iframe-box').siblings('div.button-group').find('button.btn--check').prop("disabled", true);
            }
        });
    }

    // 切換頁面滾動置頂 (解決切換step時視窗不會自動置頂)
    scrollTop() {
        window.scroll(0, 0)
    }

    // 顯示注意事項
    async showRule() {
        let PrincipalAmountTotal = 0;
        let InterestTotal = 0;
        this.EasyCashCalcCycleFeeResult.forEach(element => { PrincipalAmountTotal += +element.PrincipalAmount.replace(",","") });
        this.EasyCashCalcCycleFeeResult.forEach(element => { InterestTotal += +element.Interest.replace(",","")});

        CreditCardSensorsTrack("CardBillStagingApply",true,PrincipalAmountTotal,InterestTotal);
        const agree = await this.modalService
                .addModal(NoticeDialogComponent, {
                    Title: '信用卡帳單分期注意事項',
                    Source: 'CAWHO',
                    NoticeMatter: '永豐商業銀行信用卡帳單分期注意事項',
                    NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                    color: urlColor.None,
                })
                .toPromise();
                if (agree) {
                    CreditCardSensorsTrack("CardBillStagingNotice",true);
                    this.selectedIndex=2;
                }
                else {
                    CreditCardSensorsTrack("CardBillStagingNotice",false);
                    this.reselect();
                }
    }

    // 取得帳當分期資料
    async getStmtInstallmentData() {
        try {
            const response = await this.accountService.getStmtInstallmentData({ ID: this.idNumber });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.installmentDataResult = response.Result;
                var hideAgreeInstallmentBlock = await this.installmentDataResult.IsSignedInstallmentAgreement;
                await this.getAgreementInfo();
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
                        CreditCardSensorsTrack("CardBillStagingAgreement",true);
                        this.agreeApplyInstallment();
                    }
                    else {
                        CreditCardSensorsTrack("CardBillStagingAgreement",false);
                        this.backToPreviousButton();
                    }
                }
            }
            else if(response.ResultCode === '01'||response.ResultCode === '04') {
                this.canapply = true
            }
            else {
                let swal = Swal.fire({
                    text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
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
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 同意開啟帳單分期設定
    async setStmtInstallmentData() {
        try {
            const response = await this.accountService.setInstallmentAgreement({ ID: this.idNumber });
            if (ServiceHelper.ifSuccess(response, false)) {
                return;
            } else {
                let swal = Swal.fire({
                    text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
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
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 取得分期試算表
    async getEasyCashCalcCycleFee(period, rate, fee) {
        try {
            const response = await this.accountService.easyCashCalcCycleFee({
                LoanAmt: this.installmentDataResult.InstallmentAmt,
                Period: period,
                AnnRate: rate,
                ProcessFee: fee
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                CreditCardSensorsTrack("CardBillStagingNumber",true);
                this.EasyCashCalcCycleFeeResult = response.Result.Items;
                this.Period = period;
                this.AnnRate = rate;
                this.ProcessFee = fee;
                this.selectedIndex++
            }
            else {
                CreditCardSensorsTrack("CardBillStagingNumber",false);
                let swal = Swal.fire({
                    text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
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
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');

        }
    }

    // 送出帳當分期申請資料
    async applyStmtInstallment() {
        try {
            const response = await this.accountService.applyStmtInstallment({
                ID: this.idNumber,
                MFPCode: this.installmentDataResult.MFPCode,
                BaseMFPcode: this.installmentDataResult.BaseMFPcode,
                StmtDate: this.installmentDataResult.StmtDate,
                DueDate: this.installmentDataResult.DueDate,
                StmtAmt: this.installmentDataResult.StmtAmt,
                StmtMinAmt: this.installmentDataResult.StmtMinAmt,
                FirstPeriodAmt: Number(this.EasyCashCalcCycleFeeResult[0].MonthPayment),
                InstallmentAmt: this.installmentDataResult.InstallmentAmt,
                Period: this.Period,
                Rate: this.AnnRate,
                IRR: Number(this.EasyCashCalcCycleFeeResult[0].IRR),
                Fee: this.ProcessFee,
                Referrer: "",
                Verify_Method: "MMA"
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                CreditCardSensorsTrack("CardBillStagingConfirm",true);
                this.RefNo = response.Result.RefNo;
                this.applyStatus = true;
                this.insertAgreementRecord(this.agreementCodes[1])
            }
            else {
                CreditCardSensorsTrack("CardBillStagingConfirm",false);
                this.errorMessage = response.ResultMessage;
            }
            this.selectedIndex++;
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 返回交易紀錄-信用卡帳務-當期帳單
    backToPreviousButton(T?) {
        //backToPreviousButton來源為分期成功時紀錄埋點
        if(T === 'FinalCheck') {
            CreditCardResultSensorsTrack("CardBillStagingResult", true, this.installmentDataResult.InstallmentAmt, this.Period, this.AnnRate/100,
                this.ProcessFee,  +this.EasyCashCalcCycleFeeResult[0].PrincipalAmount.replace(",",""), +this.EasyCashCalcCycleFeeResult[0].Interest.replace(",",""));
            // 查看帳單分期申請紀錄
            this.router.navigate(['/Account/InstallmentRecord'], { queryParams: { type: 2 }});
            return;
        }
        this.app.exitWeb();
    }

    // 重新選擇
    reselect() {
        this.selectedIndex = 0;
        $(':checkbox[name="agree"]').each((i, e) => $(e).prop('checked', false).trigger('change'))
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    // 取得合約注意事項
    async getAgreementInfo() {
        try {
            for (let i = 0; i < this.agreementCodes.length; i++) {
                if(this.installmentDataResult.IsSignedInstallmentAgreement && i==0)continue
                const response = await this.agreementService.getAgreementInfo({ Title: this.agreementCodes[i], Source: "CAWHO" });
                if (ServiceHelper.ifSuccess(response, false)) {
                    switch (this.agreementCodes[i]) {
                        case "信用卡消費分期付款功能申請書":
                            this.applyInstallmentAgreementData = response.Result;
                            break
                        case "信用卡帳單分期注意事項":
                            this.installmentNoticeAgreementData = response.Result;
                            break
                        default:
                            break
                    }
                }else{
                    let swal = Swal.fire({
                        text: '系統維護中，請稍後再試！', icon: 'error', confirmButtonText: '確定',
                        showClass: {
                            popup: 'animate__animated animate__fadeIn animate__faster'
                        },
                        hideClass: {
                            popup: 'animate__animated animate__fadeOut animate__faster'
                        }
                    });
                    if ((await swal).isConfirmed) {
                        this.backToPreviousButton(false);
                    }
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
    async insertAgreementRecord(title) {
        try {
            await this.agreementService.insertAgreementRecord({
                ID: this.idNumber,
                Title: title == this.agreementCodes[0] ? this.applyInstallmentAgreementData.Title : this.installmentNoticeAgreementData.Title,
                Version: title == this.agreementCodes[0] ? this.applyInstallmentAgreementData.Version : this.installmentNoticeAgreementData.Version,
                Source: "CAWHO"
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    // 同意信用卡消費分期付款功能申請書
    agreeApplyInstallment(){
        this.setStmtInstallmentData();
        this.insertAgreementRecord(this.agreementCodes[0]);
    }
}
