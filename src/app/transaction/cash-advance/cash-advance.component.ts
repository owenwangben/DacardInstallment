import { urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { DataService } from './../../shared/services/sinopac/data.service';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { AccountService, AuthHelper, AuthService, MemberService, ServiceHelper } from 'src/app/shared/shared.module';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { SimpleModalService } from 'ngx-simple-modal';
import { CashAdvanceCardInfo, TransferAccounts } from 'src/app/shared/services/sinopac/account.models';
import { BankItem } from 'src/app/shared/services/sinopac/data.models';
import { NoticeDialogComponent } from '../../shared/dialog/notice-dialog/notice-dialog.component';
import { maskType, NumberListDialogComponent } from '../shared/dialog/number-list-dialog/number-list-dialog.component';
import { RadioboxDialogComponent } from '../shared/dialog/radiobox-dialog/radiobox-dialog.component';
import AlertHelper from 'src/app/shared/helpers/alert.helper';
import Swal from 'sweetalert2';
import { DecimalPipe } from '@angular/common';
import { CashAdvanceSensorsTrack, CreditCardSensorsTrack } from 'src/app/shared/services/sensorsdata';

@Component({
    selector: 'app-cash-advance',
    templateUrl: './cash-advance.component.html',
    styleUrls: ['./cash-advance.component.scss'],
})
export class CashAdvanceComponent implements OnInit, AfterViewInit, OnDestroy {
    private readonly app = new AppWrapper();
    // 當前步驟
    selectedIndex = 0;
    /** 預借現金當日上限 */
    private dailyLimit = 40000;
    // 持有者卡片清單
    cardList: undefined | CashAdvanceCardInfo[];
    // 持有者本行可轉帳的帳號清單
    accountList: undefined | TransferAccounts[];
    // 所有銀行清單
    bankList: undefined | BankItem[];
    // 持有者預借現金額度
    cashAvailable: undefined | number;
    // 當前選取卡名
    cardName: undefined | string;
    // 最近是否變更手機號碼
    IsChangeMobileNo: boolean;

    //#region 銀行帳戶、驗證方式名稱
    BankAccount: undefined | string;
    /** 銀行帳號 */
    BankAccountNum: undefined | string;
    BankVerify: undefined | string;
    //#endregion

    //#region 選取他行帳戶-名稱
    bankType: undefined | string;
    bankId: undefined | string;
    bankBranch: undefined | string;
    otherBankVerify: undefined | string;
    banklong: string;
    tempBranchList = [];
    //#endregion

    //#region OTP
    mobile: undefined | string;
    public sessionKey: string;
    countdown: undefined | number;
    reGenerateCount: number = 0;
    otpInterval: any;
    //#endregion

    //#region 確認資訊
    // 名稱
    confirmCardNo: undefined | string;
    confirmCardName: undefined | string;
    confirmExpiryDate: undefined | string;
    confirmAmount: undefined | number;
    confirmBankCode: undefined | string;
    confirmBankAccount: undefined | string;
    /**確認頁顯示帳號 */
    confirmShowBankAccount: boolean = true;
    // 眼睛
    isPassWord: boolean = false;
    //#endregion

    //#region Success 成功頁面
    successCardNo: undefined | string;
    successCardName: undefined | string;
    successExpiryDate: undefined | string;
    successAmount: undefined | number;
    successBankCode: undefined | string;
    successBankAccount: undefined | string;
    /**結果頁顯示帳號 */
    successShowBankAccount: boolean = true;
    /**申請預借現金交易序號 */
    refNo: string = '';
    //#endregion
    /**失敗頁面顯示錯誤代碼 */
    displayResultCode: undefined | string;

    @ViewChild('month') month: ElementRef;
    @ViewChild('year') year: ElementRef;
    // 借款金額可用額度驗證
    validatorOverQuota: ValidatorFn = (
        control: AbstractControl
    ): ValidationErrors | null => {
        if (this.cardForm) {
            const amount = control.value as number;
            return amount > this.cashAvailable ? { overQuota: true } : null;
        }
        return null;
    };

    /** 驗證借款金額不超過當日上限 */
    validatorOverDailyLimit: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
        if (control.value) {
            return this.Amount.value as number > this.dailyLimit ? { overDailyLimit: true } : null;
        }
        return null;
    };

    get Month(): FormControl {
        return this.cardForm.get('ExpiryDate.Month') as FormControl;
    }

    get Year(): FormControl {
        return this.cardForm.get('ExpiryDate.Year') as FormControl;
    }

    get Amount(): FormControl {
        return this.cardForm.get('Amount') as FormControl;
    }

    get Account(): FormControl {
        return this.cardForm.get('Account') as FormControl;
    }

    get CardNo(): FormControl {
        return this.cardForm.get('CardNo') as FormControl;
    }

    // 卡片訊息
    cardForm = new FormGroup({
        CardNo: new FormControl('', Validators.required),
        ExpiryDate: new FormGroup({
            Month: new FormControl('', [Validators.required, Validators.pattern(/^(0[123456789])|(1[012])$/)]),
            Year: new FormControl('', [Validators.required, Validators.pattern(/^[\d]{2}$/)]),
        }),
        Amount: new FormControl(null, [Validators.required, this.validatorOverQuota, this.validatorOverDailyLimit]),
        Account: new FormControl('sinopac', Validators.required),
    })

    // 銀行帳戶-共用欄位
    AccoutForm = new FormGroup({
        BankAccount: new FormControl('', Validators.required),
    })

    // 其他帳戶
    otherAccoutForm = new FormGroup({
        BankType: new FormControl('', Validators.required),
        BankID: new FormControl('', Validators.required),
        BankBranch: new FormControl('', Validators.required),
    });

    //驗證方式-共用欄位
    bankverifytForm = new FormGroup({
        BankVerify: new FormControl('', Validators.required),
    });

    get captcha(): FormControl {
        return this.otpForm.get('captcha') as FormControl;
    }

    // OTP
    otpForm = new FormGroup({
        captcha: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
    });

    // PIN
    pinForm = new FormGroup({
        password: new FormControl('', [Validators.required, Validators.minLength(4), Validators.pattern(/^[0-9]{4}$/)]),
    });

    constructor(
        private accountService: AccountService,
        private simpleModal: SimpleModalService,
        private dataService: DataService,
        private memberService: MemberService,
        private authService: AuthService,
        private _decimalPipe: DecimalPipe
    ) {

    }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('預借現金');
        try {
            //#region call api
            const getCashAdvanceApplyInfoResp = await this.accountService.getCashAdvanceApplyInfo({
                ID: AuthHelper.CustomerId,
            });
            if (ServiceHelper.ifSuccess(getCashAdvanceApplyInfoResp, false)) {
                const { CardList, CashAvailable } = getCashAdvanceApplyInfoResp.Result;
                this.cardList = CardList;
                this.cashAvailable = CashAvailable;
                this.IsChangeMobileNo = getCashAdvanceApplyInfoResp.Result.IsChangeMobileNo;

                const transferAccounts = this.accountService.transferAccounts({
                    ID: AuthHelper.CustomerId,
                    IsLimitFunction: true
                });
                const getBankList = this.dataService.getBankList();
                const [accounts, bankList] = await Promise.all([transferAccounts, getBankList]);
                const allResponse = [accounts, bankList];
                // handle api Error
                for (const response of allResponse) {
                    if (!ServiceHelper.ifSuccess(response)) { return; };
                }
                // 過濾807永豐
                this.bankList = bankList.Result.Items.filter(a => a.BankCode !== '807');
                this.accountList = accounts.Result.Items;
                if (this.accountList?.length > 0) {
                    this.Account.setValue('sinopac');
                }
                else {
                    this.Account.setValue('other');
                }
                //#endregion
                await this.getMobie();
            } else if (getCashAdvanceApplyInfoResp.ResultCode == '04') {
                const swal = Swal.fire({
                    text: '親愛的卡友您好，您目前的本行卡片均無預借現金功能，若有疑問，請聯繫客服(02)25287776。',
                    icon: 'error',
                    confirmButtonText: '聯繫客服',
                    showCancelButton: true,
                    cancelButtonText: '回帳務明細',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    },
                    allowOutsideClick: false,
                });
                if ((await swal).isConfirmed) {
                    this.app.showCustomerService();
                }
                else {
                    this.goCardManage();
                }

            } else {
                AlertHelper.showErrorAndExitWebView(getCashAdvanceApplyInfoResp.ResultMessage);
            }
        } catch (error) {
            console.log(error);
            AlertHelper.showErrorAndExitWebView('系統發生錯誤，請稍後再試！');
        }

        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'OTPDayGenerateLimit' && event.action === 0) {//驗證碼發送次數已達上限
                this.goCardAccount();
            }
            if (event.id === 'VerifyOTPLimit' && event.action === 1) {//OTP驗證錯誤次數達上限
                this.callCustomerServer();
            }
            if (event.id === 'VerifyPINLimit' && event.action === 1) { //預借現金密碼錯誤 > 3次
                this.callCustomerServer();
            }
            if (event.id === 'VerifyOTPFail' && event.action === 0) { //OTP驗證失敗(接API Msg)
                this.goCardAccount();
            }
        });
    }

    ngAfterViewInit(): void {
        const monthDom = this.month.nativeElement as HTMLInputElement;
        monthDom.addEventListener('keyup', () => {
            if (this.Month.value.length === 2) {
                const yearDom = this.year.nativeElement as HTMLInputElement;
                yearDom.focus();
            }
        })
        this.scrollTop();
    }

    ngOnDestroy(): void {
        clearInterval(this.otpInterval);
        this.simpleModal.removeAll();
    }
    //#region dialog

    /** 信用卡卡號 */
    async openAcctCreditCard() {
        const result = await this.simpleModal.addModal(NumberListDialogComponent, {
            title: '請選擇信用卡卡號',
            list: this.cardList?.map(a => { return { name: a.Name, value: a.CardNo } }),
            mask: true,
            value: this.cardForm.get('CardNo')?.value
        }).toPromise();
        if (result) {
            this.cardForm.get('CardNo')?.setValue(result);
            this.cardName = this.cardList.find(a => a.CardNo === result).Name
        }
    }

    /** 永豐帳戶-轉入銀行帳號 */
    async openAcctBankAccount() {
        const result = await this.simpleModal.addModal(NumberListDialogComponent, {
            title: '請選擇銀行帳號',
            list: this.accountList?.map(acc => { return { name: acc.AccountName, value: acc.AccountNo } }),
            mask: true,
            maskType: maskType.custom,
            value: this.AccoutForm.get('BankAccount')?.value
        }).toPromise();
        if (result) {
            this.BankAccount = this.accountList.find(x => x.AccountNo === result).AccountName;
            this.AccoutForm.get('BankAccount')?.setValue(result);
            this.BankAccountNum = result;
        }
    }

    /** 永豐|其他帳戶-驗證方式 */
    async openBankVerify() {
        let list: { name: string, value: number, comment?: string }[] = [];
        if (!this.mobile || this.mobile.trim().length < 10 || this.IsChangeMobileNo) {//如無手機號碼、近期變更過手機號碼 預借現金驗證方式則隱藏
            list.push({
                name: '預借現金密碼',
                value: 1,
            });
        } else {
            list.push({
                name: '簡訊動態密碼',
                value: 2,
                comment: '(一次性預借現金密碼)'
            }, {
                name: '預借現金密碼',
                value: 1,
            })
        }
        const value = this.bankverifytForm.get('BankVerify')?.value;
        const result = await this.simpleModal.addModal(RadioboxDialogComponent, {
            title: '請選擇驗證方式',
            list,
            value
        }).toPromise();
        if (result) {
            const item = list.find(a => a.value === result);
            this.bankverifytForm.get('BankVerify')?.setValue(result);
            this.BankVerify = item.name + (item.comment ?? '');
        }
    }

    /** 其他帳戶-銀行類型 */
    async openOtherBankType() {
        const list: { name: string, value: number, comment?: string }[] = [
            { name: '本國銀行', value: 1, },
            { name: '外國銀行', value: 2, },
            { name: '信用合作社', value: 3, },
            { name: '農會', value: 4, },
            { name: '郵局', value: 5, },
            { name: '漁會', value: 6, },
            { name: '其他金融機構', value: 9, },
        ]
        const result = await this.simpleModal.addModal(RadioboxDialogComponent, {
            title: '請選擇銀行類型',
            list,
            filter: false,
            value: this.otherAccoutForm.get('BankType')?.value
        }).toPromise();
        if (result) {
            this.otherAccoutForm.get('BankType')?.setValue(result);
            const item = list.find(a => a.value === result);
            this.bankType = item.name + (item.comment ?? '');

            //重置分行、帳號下拉欄位
            this.BankInputClear('all');
        }
    }

    /** 其他帳戶-銀行代碼 */
    async openOtherBankID() {
        if (this.otherAccoutForm.get('BankType').value !== '') {
            const bankID = String(this.otherAccoutForm.get('BankType').value);
            const result = await this.simpleModal.addModal(RadioboxDialogComponent, {
                title: '請選擇銀行代碼',
                list: this.bankList.filter(x => x.Type === bankID).map(a => { return { name: a.BankName, value: a.BankCode } }),
                filter: true,
                value: this.otherAccoutForm.get('BankID')?.value
            }).toPromise();
            if (result) {
                this.otherAccoutForm.get('BankID')?.setValue(result);
                const item = this.bankList.find(a => a.BankCode === result);
                this.banklong = item.BankLong;
                this.bankId = item.BankName;
                this.BankInputClear('branch');
                this.tempBranchList = [];
                (await this.GetBranchList(this.otherAccoutForm.get('BankID').value)).map(
                    item => this.tempBranchList.push({ name: item.BranchCode + " " + item.FullName, value: item.BranchCode })
                );
            }
        } else {
            ServiceHelper.showError('請先選擇銀行類型');
            return;
        }
    }

    /** 其他帳戶-銀行分行 */
    async openOtherBankBranch() {
        if (this.otherAccoutForm.get('BankID').value !== '') {
            let temp = this.tempBranchList;
            const result = await this.simpleModal.addModal(RadioboxDialogComponent, {
                title: '請選擇分行',
                list: temp,
                value: this.otherAccoutForm.get('BankBranch')?.value,
                filter: true
            }).toPromise();
            if (result) {
                this.otherAccoutForm.get('BankBranch')?.setValue(result);
                const item = temp.find(a => a.value === result);
                this.bankBranch = item.name;
            }
        } else {
            if (this.otherAccoutForm.get('BankType').value === '') {
                ServiceHelper.showError('請先選擇銀行類型');
                return;
            }
            ServiceHelper.showError('請先選擇銀行代碼');
            return;
        }
    }
    //#endregion

    async submit() {
        const isSinopac = this.Account?.value === 'sinopac';
        this.cardForm.markAllAsTouched();
        if (this.cardForm.get('CardNo')?.hasError('required')) {
            ServiceHelper.showError('請選擇信用卡');
            return;
        }
        if (this.cardForm.get('ExpiryDate.Month')?.hasError('required') || this.cardForm.get('ExpiryDate.Year')?.hasError('required')) {
            ServiceHelper.showError('請輸入卡片有效期限');
            return;
        } if (!this.cardForm.controls.ExpiryDate.valid) {
            // 有效日期格式錯誤
            return
        }
        if (this.cardForm.get('Amount')?.hasError('required')) {
            ServiceHelper.showError('請輸入借款金額');
            return;
        }
        if (Number(this.cardForm.get('Amount').value) < 0) {
            ServiceHelper.showError('申請增加額度不可輸入負值');
            this.cardForm.get('Amount').setValue(undefined);
            return;
        }
        if (Number(this.cardForm.get('Amount').value) === 0) {
            ServiceHelper.showError('申請增加額度不能輸入0');
            this.cardForm.get('Amount').setValue(undefined);
            return;
        }
        if (this.cardForm.get('Amount')?.hasError('overQuota')) {
            ServiceHelper.showError('借款金額已超過可用額度，請重新輸入');
            return;
        }
        if (this.cardForm.get('Amount')?.hasError('overDailyLimit')) {
            const amount = this._decimalPipe.transform(this.dailyLimit, '1.0-0');
            ServiceHelper.showError(`每日上限不得逾 ${amount} 元，請重新輸入`);
            return;
        }
        //其他帳戶
        if (!isSinopac) {
            if (this.otherAccoutForm.get('BankType')?.hasError('required')) {
                ServiceHelper.showError('請選擇轉入銀行類型');
                return;
            }
            if (this.otherAccoutForm.get('BankID')?.hasError('required')) {
                ServiceHelper.showError('請選擇轉入銀行代碼');
                return;
            }
            if (this.otherAccoutForm.get('BankBranch')?.hasError('required')) {
                ServiceHelper.showError('請選擇轉入銀行分行');
                return;
            }
            if (!this.AccoutForm.get('BankAccount')?.hasError('required')) {
                const BankLong = this.banklong.split(',');
                if (!this.checkBankLong(BankLong)) {
                    ServiceHelper.showError('銀行帳號長度錯誤，請再確認，謝謝。');
                    return;
                }
            }
        }
        const account = this.AccoutForm.get('BankAccount');
        if (account?.hasError('required')) {
            ServiceHelper.showError('請輸入轉入銀行帳號');
            return;
        }
        const bankVerify = this.bankverifytForm.get('BankVerify')
        if (bankVerify?.hasError('required')) {
            ServiceHelper.showError('請選擇驗證方式');
            return;
        }

        //神策事件埋點
        CashAdvanceSensorsTrack("CashAdvanceInput",true);

        const isAgree = await this.simpleModal.addModal(NoticeDialogComponent, {
            Title: '申請預借現金注意事項',
            Source: 'CAWHO',
            NoticeMatter: '永豐商業銀行預借現金注意事項',
            NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
            color: urlColor.None
        }).toPromise();

        if (isAgree) {
            //神測埋點
            CashAdvanceSensorsTrack("CashAdvanceNotice",true);
            // 1 預借現金
            if (bankVerify.value === 1) {
                this.selectedIndex = 2;
                this.setConfirm(isSinopac);
            }
            if (bankVerify.value === 2) {
                this.selectedIndex = 1;
                const text = "<div style='text-align:left'>為使您順利取得簡訊動態密碼，請確認以下事項後再按確定"
                    + "<br>1.您設定接受簡訊動態密碼的手機號碼為" + this.maskMobileNo(this.mobile)
                    + "<br>2.目前手機為開機、可接收簡訊、簡訊內容量充足的狀態。</div>";
                const result = Swal.fire({
                    html: text, title: '', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                if ((await result).isConfirmed) { //確認後才開始計時
                    CashAdvanceSensorsTrack("CashAdvanceGetSMSVertificationCode",true);
                    await this.generateOTP();
                }
            }
        }
        else {
            CashAdvanceSensorsTrack("CashAdvanceNotice",false);
        }
    }

    /** 取得手機號碼 */
    async getMobie() {
        const response = await this.memberService.QueryMobile({ ID: AuthHelper.CustomerId })
        if (ServiceHelper.ifSuccess(response)) {
            this.mobile = response.Result.Mobile;
            this.sessionKey = response.Result.SessionKey;
        }
    }

    /** 取得OTP */
    async generateOTP(regenerate: boolean = false) {
        if (!this.mobile) {
            this.app.showMsgDialog({ id: 'QueryMobileIsEmpty', title: '手機號碼為空', msg: '手機號碼為空', btnStr: '確定' });
            return;
        }

        if (!regenerate) {
            this.otpInterval = setInterval(() => {
                if (this.countdown > 0) {
                    this.countdown--;
                }
            }, 1000);
        }
        else if (regenerate) {
            if ((this.reGenerateCount) >= 2) {
                this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
                return;
            }
        }

        const OTPResponse = await this.memberService.GenerateOTP({ ID: AuthHelper.CustomerId, mobile: this.mobile, functionCode: 12, RequireCheckTimeout: regenerate, SessionKey: this.sessionKey })
        if (ServiceHelper.ifSuccess(OTPResponse, false)) {
            this.countdown = 120;
            if (regenerate) {
                this.reGenerateCount++;
            }
        }
        else if (OTPResponse.ResultCode == '01') {
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
        } else if (OTPResponse.ResultCode == '02') {
            this.app.showMsgDialog({ id: 'OTPDayErrorLimit', title: '驗證碼錯誤次數達上限', msg: OTPResponse.ResultMessage, btnStr: '確定' });
        }
        else if (OTPResponse.ResultCode == '06') {
            this.app.showMsgDialog({ id: 'OTPNotExpired', title: '簡訊密碼未失效', msg: '剛剛傳送給您的簡訊密碼尚未失效!', btnStr: '確定' });
            return;
        }
    }

    /** OTP驗證 */
    async OTPSubmit() {
        this.otpForm.markAllAsTouched();

        // 表單檢核
        if (!this.otpForm.valid) return;

        // 驗證OTP
        const VerifyResponse = await this.memberService.VerifyOTP({ functionCode: 12, ID: AuthHelper.CustomerId, otp: this.captcha.value });
        if (ServiceHelper.ifSuccess(VerifyResponse, false)) {
            CashAdvanceSensorsTrack("CashAdvanceInputSMSVertificationCode",true);
            const isSinopac = this.Account?.value === 'sinopac';
            this.selectedIndex = 2;
            this.setConfirm(isSinopac);
        }
        else if (VerifyResponse.ResultCode == '04') {
            CashAdvanceSensorsTrack("CashAdvanceInputSMSVertificationCode",false);
            this.app.showMsgDialog({ id: 'VerifyOTPFailCount', title: 'OTP驗證錯誤', msg: '驗證碼錯誤，請重新輸入', btnStr: '確定' });
            return; // OTP驗證次數未達上限
        }
        else if (VerifyResponse.ResultCode == '02' && VerifyResponse.Result.HasReachedMaxTries) {
            CashAdvanceSensorsTrack("CashAdvanceInputSMSVertificationCode",false);
            this.app.showMsgSelDialog({ id: 'VerifyOTPLimit', title: 'OTP驗證次數已達上限', msg: '驗證碼錯誤已達上限。', btnOK: '確定', btnNO: '聯繫客服' });
            return; // OTP驗證次數已達上限
        }
        else {
            CashAdvanceSensorsTrack("CashAdvanceInputSMSVertificationCode",false);
            this.app.showMsgDialog({ id: 'VerifyOTPFail', title: 'OTP驗證失敗', msg: VerifyResponse.ResultMessage, btnStr: '確定' });
            return; // OTP驗證失敗
        }
    }

    /**
     * 設定確認頁顯示資訊
     * @param isSinopac
     */
    setConfirm(isSinopac: boolean) {
        this.confirmCardNo = this.CardNo.value;
        this.confirmCardName = this.cardName;
        this.confirmExpiryDate = this.Month.value + '/' + this.Year.value;
        this.confirmAmount = this.Amount.value;
        this.confirmBankCode = (isSinopac ? (this.BankAccount ?? '') : (this.bankId ?? ''));
        this.confiBAVisible();
    }

    /**
     * 確證頁銀行帳號顯示開關
     */
    confiBAVisible() {
        this.confirmShowBankAccount = !this.confirmShowBankAccount;
        const baValue = this.AccoutForm.get('BankAccount').value;
        if (this.confirmShowBankAccount)
            this.confirmBankAccount = baValue;
        else
            this.confirmBankAccount = baValue.substring(0, 3) + '●●●●●●' + baValue.substring(9, baValue.length);
    }

    /** OTP驗證 */
    async updateFunctionCount() {
        try {
            await this.authService.UpdateFunctionCount({
                FunctionCode: "12",
                FunctionKey: AuthHelper.CustomerId,
                Source: "DACARD"
            })
        } catch (error) {
            console.log(error);
        }
    }

    /** 滾到最上面 */
    scrollTop() {
        window.scroll(0, 0)
    }

    /** 設定成功資訊
     * @param refNo 交易編號
    */
    async setSuccess(refNo: string) {
        await this.app.initHeaderMenu('DACARD');
        const isSinopac = this.Account?.value === 'sinopac';
        // 永豐成功
        this.successCardNo = this.CardNo.value;
        this.successCardName = this.cardName;
        this.successExpiryDate = this.Month.value + '/' + this.Year.value;
        this.successAmount = this.Amount.value;
        this.successBankCode = (isSinopac ? this.BankAccount : this.bankId) ?? '';
        this.refNo = refNo;
        this.successBAVisible();
    }

    /**
    * 確證頁銀行帳號顯示開關
    */
    successBAVisible() {
        this.successShowBankAccount = !this.successShowBankAccount;
        const baValue = this.AccoutForm.get('BankAccount').value;
        if (this.successShowBankAccount)
            this.successBankAccount = baValue;
        else
            this.successBankAccount = baValue.substring(0, 3) + '●●●●●●' + baValue.substring(9, baValue.length);
    }

    goCardAccount() {

        this.app.exitWeb();
    }

    /** 導到 信用卡帳號_未出帳 */
    goCardManage() {
        this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
    }

    // 聯絡客服
    callCustomerServer() {

        this.app.showCustomerService();
    }

    async applyCashAdvance() {
        try {
            const isSinopac = this.Account?.value === 'sinopac';
            const bankVerify = this.bankverifytForm.get('BankVerify');
            if (bankVerify.value === 1) {// 預借現金密碼驗證
                if (this.pinForm.get('password')?.errors) {
                    ServiceHelper.showError('請輸入4位數預借現金密碼');
                    return;
                }
            }
            CashAdvanceSensorsTrack("CashAdvanceConfirm",true); //神策埋點
            const response = await this.accountService.applyCashAdvance(
                {
                    ID: AuthHelper.CustomerId,
                    CardNo: this.cardForm.get('CardNo').value,
                    ExpiryDate: this.cardForm.get('ExpiryDate.Month').value + this.cardForm.get('ExpiryDate.Year').value,
                    PIN: bankVerify.value === 1 ? this.pinForm.get('password').value : this.otpForm.get('captcha').value, //1:預借現金密碼 2:OTP
                    TransBankCode: !isSinopac ? this.otherAccoutForm.get('BankID').value + this.otherAccoutForm.get('BankBranch').value : '',// 行號+分行號 共7碼
                    TransAccount: this.AccoutForm.get('BankAccount').value,
                    Amount: this.cardForm.get('Amount').value,
                    PinType: bankVerify.value //PIN:1  OTP:2
                })
            if (ServiceHelper.ifSuccess(response, false)) { //申請成功
                CashAdvanceSensorsTrack("CashAdvanceResult",true,this.Amount.value); //神策埋點

                if (bankVerify.value === 2) { //OTP驗證時關閉倒數
                    await this.updateFunctionCount();
                    //關閉OTP倒數
                    this.countdown = 0;
                    clearInterval(this.otpInterval);
                    this.scrollTop();
                }
                await this.setSuccess(response.Result.RefNo);
                this.selectedIndex = 3;
            } else if (response.Result && response.Result.IsPinError) { // 預現密碼或簡訊動態密碼錯誤
                CashAdvanceSensorsTrack("CashAdvanceResult",false,this.Amount.value); //神策埋點
                if (bankVerify.value === 2) {//OTP驗證錯誤訊息
                    this.app.showMsgDialog({ id: 'VerifyOTPFailCount', title: 'OTP驗證錯誤', msg: '驗證碼錯誤，請重新輸入', btnStr: '確定' });
                    return;
                }
                this.app.showMsgDialog({ id: 'VerifyPINFail', title: '預借現金密碼錯誤', msg: '信用卡預借現金密碼錯誤，請重新輸入', btnStr: '確定' });
                return;
            } else if (response.ResultCode === '15') { //預借現金密碼錯誤
                CashAdvanceSensorsTrack("CashAdvanceResult",false,this.Amount.value); //神策埋點
                this.app.showMsgDialog({ id: 'VerifyPINFail', title: '預借現金密碼錯誤', msg: '信用卡預借現金密碼錯誤，請重新輸入', btnStr: '確定' });
                return;
            } else if (response.ResultCode === '31') { //密碼錯誤超過3次
                CashAdvanceSensorsTrack("CashAdvanceResult",false,this.Amount.value); //神策埋點
                this.app.showMsgSelDialog({ id: 'VerifyPINLimit', title: '預借現金密碼錯誤超過3次', msg: '預借現金密碼錯誤超過3次，請聯繫客服02-25287776。', btnOK: '確定', btnNO: '聯繫客服' });
                return;
            } else { //其他錯誤，導頁到失敗頁面
                CashAdvanceSensorsTrack("CashAdvanceResult",false,this.Amount.value); //神策埋點
                this.displayResultCode = response.ResultCode;
                this.selectedIndex = 4;
                return;
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    async GetBranchList(BankCode: string) {
        if (!BankCode) { return []; }
        const response = await this.dataService.getBranchList({ BankCode: BankCode });
        if (!ServiceHelper.ifSuccess(response, false)) {
            return [];
        }
        return response.Result.Items;
    }

    BankInputClear(CloseFlag: string) { //清空銀行代號、分行欄位
        if (CloseFlag === 'all') {
            this.otherAccoutForm.get('BankID')?.setValue('');
            this.bankId = undefined;
            this.otherAccoutForm.get('BankBranch')?.setValue('');
            this.bankBranch = undefined;
        } else if (CloseFlag === 'branch') {
            this.otherAccoutForm.get('BankBranch')?.setValue('');
            this.bankBranch = undefined;
        }
    }

    /**遮蓋手機號碼 */
    maskMobileNo(value: any, args?: any) {
        const pattern = /(\d{4})-?(\d{3})-?(\d{3})/;
        const replace = '$1xxx$3';
        return value ? value.replace(pattern, replace) : value;
    }

    /**檢查銀行帳號長度 */
    checkBankLong(BankLong: string[]): boolean {
        for (const long of BankLong) {
            if (this.AccoutForm.get('BankAccount').value.length === +long) {
                return true;
            }
        }
        return false;
    }

    /**切換轉入帳戶時清空欄位 */
    switchInputClear(account: string) {
        if (account === 'other') {// 其他
            this.otherAccoutForm.setValue(
                {
                    BankType: '',
                    BankID: '',
                    BankBranch: '',
                });
            this.bankType = undefined;
            this.bankId = undefined;
            this.bankBranch = undefined;
            this.otherBankVerify = undefined;
        }
        this.AccoutForm.setValue({
            BankAccount: '',
        });
        this.bankverifytForm.setValue({
            BankVerify: '',
        });
        this.BankAccount = undefined;
        this.BankAccountNum = undefined;
        this.BankVerify = undefined;
    }
}
