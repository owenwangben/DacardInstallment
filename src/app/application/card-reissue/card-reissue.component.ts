import { LostCardItem } from './../../shared/services/sinopac/apply.model';
import { RadioboxDialogComponent } from './../../transaction/shared/dialog/radiobox-dialog/radiobox-dialog.component';
import { NoticeDialogComponent, urlColor } from './../../shared/dialog/notice-dialog/notice-dialog.component';
import { SimpleModalService } from 'ngx-simple-modal';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { MemberService, AuthHelper, ServiceHelper, ApplyService, BonusService } from 'src/app/shared/shared.module';
import { Router } from '@angular/router';
import { ReissueCard } from 'src/app/shared/services/sinopac/apply.model';
import { ReissueCardModel, reissueType } from './card-reissue.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-card-reissue',
    templateUrl: './card-reissue.component.html',
    styleUrls: ['./card-reissue.component.scss']
})
export class CardReissueComponent implements OnInit {
    private readonly app = new AppWrapper();
    selectedIndex = 0; //頁面控制
    /** true => 遺失:Loss ; false => 毀損:Damag */
    isLoss: boolean;
    imgPath: string = 'mma8/card/images/card-lost/';

    //#region 使用者資訊
    idNumber: string;
    productCode: string;
    cardFace: string;
    cardNo: string;
    cardReissueList = new Array<LostCardItem>();
    situation: string;
    //#endregion

    //#region 顯示資訊用變數
    damageReason: string; //損毀原因
    displayDate = new Date(); //客戶申請換補發資訊日期
    successDateTime = new Date();//換補發申請成功日期
    hideInfo: boolean = true; //眼睛隱藏資訊flag
    displayCardImgUrl: string = '';//最上方主卡圖片顯示 路徑+ProductCode+CardFace
    displayCardName: string;//顯示卡名
    confirmAddr: string;//確認頁顯示地址
    AllSuccess: boolean = false; // 申請換發判斷回傳申請成功
    AllFailStatus: boolean = false //申請換發判斷回傳申請失敗
    displayCardBrand: string;//顯示卡別
    addressFlag: boolean = true; // 地址欄位區塊顯示flag (虛擬卡不顯示地址)
    //#endregion

    //#region OTP
    mobile: undefined | string;
    public sessionKey: string;
    countdown: undefined | number;
    reGenerateCount: number = 0;
    otpInterval: any;
    //#endregion

    //#region 信用卡資訊
    ReissueCardItem = new Array<ReissueCard>();
    primarySelectedCards = []; // 主卡勾選狀態
    primaryCardItem = new Array<ReissueCard>(); // 主卡清單
    selectPrimaryCardItem = new Array<ReissueCard>(); // 勾選主卡清單
    additionalSelectedCards = []; // 副卡勾選狀態
    additionalCardItem = new Array<ReissueCard>(); // 附卡清單
    selectAdditionalCardItem = new Array<ReissueCard>(); // 勾選附卡清單
    primaryCardResult = new Array<ReissueCardModel>(); // 申請換發-回傳主卡
    additionalCardResult = new Array<ReissueCardModel>(); // 申請換發-回傳附卡
    displayAddressRs: string; //顯示申請換發 回傳地址
    //#endregion

    //#region 使用者地址
    homeAddress: string; //現居地址
    residentAddr: string; //戶籍地址
    companyAddr: string; //公司地址
    //#endregion

    // OTP
    otpForm = new FormGroup({
        captcha: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
    });

    get captcha(): FormControl {
        return this.otpForm.get('captcha') as FormControl;
    }

    //毀損原因form
    damageForm = new FormGroup({
        reason: new FormControl('', [Validators.required])
    });

    //地址form
    addressForm = new FormGroup({
        address: new FormControl('', [Validators.required])
    })

    constructor(
        private memberService: MemberService,
        private simpleModal: SimpleModalService,
        private router: Router,
        private applyService: ApplyService,
        private bonusService: BonusService,
    ) {
        this.setupData();
        this.app.initHeaderBack('線上補發');
    }

    /** 設定資料 */
    setupData() {
        this.cardReissueList = history.state.items;//從遺失掛失選取的cardList
        if (this.cardReissueList) {
            this.isLoss = history.state.switchPage === reissueType.Loss;
            this.situation = history.state.Situation;
            this.idNumber = AuthHelper.CustomerId;
            const reissueCard = this.cardReissueList[0];
            this.productCode = reissueCard.ProductCode;
            this.cardFace = reissueCard.CardFace;
            this.cardNo = reissueCard.CardNo;
        } else {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
            this.router.navigate(['/Account/CardManage']);
        }
    }

    async ngOnInit(): Promise<void> {
        const data = {
            Title: this.isLoss ? '信用卡掛失補發注意事項' : '信用卡毀損補發注意事項',
            Source: 'CAWHO',
            NoticeMatter: this.isLoss ? '永豐商業銀行信用卡掛失補發注意事項' : '永豐商業銀行信用卡毀損補發注意事項',
            NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
            color: urlColor.None
        } //遺失和毀損2者的條款不同
        this.simpleModal.addModal(NoticeDialogComponent, data)
            .subscribe(async isAgree => {
                if (isAgree) {
                    await this.getMobie();
                    await this.generateOTP();
                } else {
                    this.backToLast();
                }
            });
        this.msgDialoglistening();
    }

    /**error msg dialog 監聽 */
    msgDialoglistening() {
        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'OTPDayGenerateLimit' && event.action === 0) {//驗證碼發送次數已達上限
                this.backToLast();
            }
            if (event.id === 'VerifyOTPLimit' && event.action === 1) {//OTP驗證錯誤次數達上限
                this.callCustomerServer();
            }
            if (event.id === 'VerifyOTPFail' && event.action === 0) { //OTP驗證失敗(接API Msg)
                this.backToLast();
            }
        });
    }

    /** 選擇損毀原因 */
    async openDamageReason() {
        const list = [{
            name: '個人因素',
            value: 1
        },
        {
            name: '卡片毀損',
            value: 2
        },
        {
            name: '卡片脫膜',
            value: 3
        },
        {
            name: '晶片毀損',
            value: 4
        }];
        this.simpleModal.addModal(RadioboxDialogComponent, {
            title: '請選擇補發原因',
            list,
            value: this.damageForm.get('reason').value
        }).subscribe(result => {
            if (result) {
                const item = list.find(x => x.value === result);
                this.damageForm.get('reason').setValue(result);
                this.damageReason = item.name;
            }
        })
    }

    /** OTP驗證 */
    async OTPSubmit() {
        this.otpForm.markAllAsTouched();

        // 表單檢核
        if (!this.otpForm.valid) return;

        // 驗證OTP
        const VerifyResponse = await this.memberService.VerifyOTP({ functionCode: this.isLoss ? 103 : 104, ID: AuthHelper.CustomerId, otp: this.captcha.value });
        if (ServiceHelper.ifSuccess(VerifyResponse, false)) {
            await this.getReissueCardInfo();
            this.addressForm.get('address').setValue('1');//預設選擇現居地址
            this.confirmAddr = this.homeAddress;//顯示用現居地址
            if (!this.isLoss) { //毀損:顯示毀損原因
                this.damageForm.get('reason').setValue(1);
                this.damageReason = '個人因素';
            }
            this.countdown = 0;
            clearInterval(this.otpInterval);
            this.selectedIndex = 1;
        }
        else if (VerifyResponse.ResultCode == '04') {
            this.app.showMsgDialog({ id: 'VerifyOTPFailCount', title: 'OTP驗證錯誤', msg: '驗證碼錯誤，請重新輸入', btnStr: '確定' });
            return; // OTP驗證次數未達上限
        }
        else if (VerifyResponse.ResultCode == '02' && VerifyResponse.Result.HasReachedMaxTries) {
            this.app.showMsgSelDialog({ id: 'VerifyOTPLimit', title: 'OTP驗證次數已達上限', msg: '驗證碼錯誤已達上限，請重新申請。', btnOK: '確定', btnNO: '聯繫客服' });
            return; // OTP驗證次數已達上限
        }
        else {
            this.app.showMsgDialog({ id: 'VerifyOTPFail', title: 'OTP驗證失敗', msg: VerifyResponse.ResultMessage, btnStr: '確定' });
            return; // OTP驗證失敗
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

        const OTPResponse = await this.memberService.GenerateOTP({
            ID: AuthHelper.CustomerId,
            mobile: this.mobile,
            functionCode: this.isLoss ? 103 : 104, //掛失:103 、毀損:104
            RequireCheckTimeout: regenerate,
            SessionKey: this.sessionKey
        });
        if (ServiceHelper.ifSuccess(OTPResponse, false)) {
            this.countdown = 120;
            if (regenerate) {
                this.reGenerateCount++;
            }
        }
        else if (OTPResponse.ResultCode == '01') {
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼發送次數達上限', msg: '驗證碼發送次數達上限，請明日再試。', btnStr: '確定' });
        } else if (OTPResponse.ResultCode == '02') {
            this.app.showMsgDialog({ id: 'OTPDayGenerateLimit', title: '驗證碼錯誤次數達上限', msg: OTPResponse.ResultMessage, btnStr: '確定' });
        }
        else if (OTPResponse.ResultCode == '06') {
            this.app.showMsgDialog({ id: 'OTPNotExpired', title: '簡訊密碼未失效', msg: '剛剛傳送給您的簡訊密碼尚未失效!', btnStr: '確定' });
            return;
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

    // 取得掛失卡片主附卡清單
    async getReissueCardInfo() {
        const response = await this.applyService.QueryCardReissue({
            ID: this.idNumber,
            Type: this.isLoss ? '1' : '2',
            ProductCode: this.productCode,
            CardFace: this.cardFace
        });
        if (ServiceHelper.ifSuccess(response, false)) {
            let typeFace = '';
            //取得地址
            this.homeAddress = response.Result.HomeAddress;
            this.residentAddr = response.Result.ResidentAddress;
            this.companyAddr = response.Result.CompanyAddress;
            //分類正、附卡，以及建立勾取判斷陣列
            if (this.situation === 'FromCardLost') { //掛失頁選取的卡片
                this.primaryCardItem = this.cardReissueList.filter((e) => e.CardTypeCode !== "NP");
                this.additionalCardItem = this.cardReissueList.filter((e) => e.CardTypeCode === "NP");
                this.displayCardImgUrl = this.imgPathConcat(this.cardReissueList[0].ProductCode + this.cardReissueList[0].CardFace);
                this.displayCardName = this.cardReissueList[0].Name;
                this.displayCardBrand = this.cardReissueList[0].CardBrand;
                typeFace = this.cardReissueList[0].ProductCode + this.cardReissueList[0].CardFace;
            } else {//取得 換發資訊回傳cardList
                if (response.Result.Items.length > 0) {
                    this.ReissueCardItem = response.Result.Items;
                    this.primaryCardItem = this.ReissueCardItem.filter((e) => e.CardTypeCode !== "NP");
                    this.additionalCardItem = this.ReissueCardItem.filter((e) => e.CardTypeCode === "NP");
                    this.displayCardImgUrl = this.imgPathConcat(this.ReissueCardItem[0].ProductCode + this.ReissueCardItem[0].CardFace);
                    this.displayCardName = this.ReissueCardItem[0].Name;
                    this.displayCardBrand = this.ReissueCardItem[0].CardBrand;
                    typeFace = this.ReissueCardItem[0].ProductCode + this.ReissueCardItem[0].CardFace;
                } else {
                    this.callCustomerServer();
                }
            }
            this.primarySelectedCards = new Array(this.primaryCardItem.length).fill(false);
            this.additionalSelectedCards = new Array(this.additionalCardItem.length).fill(false);

            const feedBackResponse = await this.bonusService.QueryCardFeedbackType({});
            if (ServiceHelper.ifSuccess(feedBackResponse)) {
                const isVirtualCard = feedBackResponse.Result.Items.find(x => x.CardFaceId === Number(typeFace) && x.FeedBackType === 12);
                if (isVirtualCard) {
                    this.addressFlag = false;
                    this.addressForm.get('address').setValidators(Validators.nullValidator); //關閉地址必填
                    this.addressForm.get('address').updateValueAndValidity();
                }
            } else {
                ServiceHelper.showError(feedBackResponse?.ResultMessage);
                return;
            }
            //正卡預設選取，且無法取消勾選
            if (this.primaryCardItem.length !== 0) {
                this.primaryCardItem.forEach((item, index) => this.changeSelectCardItems(index, item.CardTypeCode));
            }
        } else {
            ServiceHelper.showError(response?.ResultMessage);
            this.router.navigateByUrl('/Account/CardManage');
            return;
        }
    }

    imgPathConcat(imgCode: string) {
        return this.imgPath.concat(imgCode, '.png');
    }

    // 卡片種類判斷
    addCardBrandclass(brand: string) {
        switch (brand) {
            case 'M':
                return 'icon--master';
            case 'V':
                return 'icon--visa--blue';
            case 'J':
                return 'icon--jcb';
            default:
                return '';
        }
    }

    changeSelectCardItems(i, cardTypeCode) {
        if (cardTypeCode !== "NP") {
            this.primarySelectedCards = new Array(this.primaryCardItem.length).fill(!this.primarySelectedCards[i]);
        } else {
            this.additionalSelectedCards[i] = !this.additionalSelectedCards[i];
        }
        this.selectPrimaryCardItem = this.primaryCardItem.filter((e, i) => this.primarySelectedCards[i] && e.CardTypeCode !== "NP");
        this.selectAdditionalCardItem = this.additionalCardItem.filter((e, i) => this.additionalSelectedCards[i] && e.CardTypeCode === "NP");
    }

    submit() {
        if (!this.isLoss) {
            if (this.damageForm.get('reason')?.hasError('required')) {
                ServiceHelper.showError('請選擇損毀原因');
                return;
            }
        } else {
            if (this.primaryCardItem.length !== 0) { //有主卡資料時檢驗
                if (this.selectPrimaryCardItem.length === 0) {
                    ServiceHelper.showError('請選擇正卡');
                    return;
                }
            } else if (this.additionalCardItem.length !== 0) {//有附卡資料時檢驗
                if (this.selectAdditionalCardItem.length === 0) {
                    ServiceHelper.showError('請選擇附卡');
                    return;
                }
            }
        }
        if (this.addressForm.get('address')?.hasError('required')) {
            ServiceHelper.showError('請選擇地址');
            return;
        }
        //取得申請換補發api資訊填入頁面
        this.displayDate = new Date();
        this.hideInfo = true; //重置眼睛顯示
        this.selectedIndex = 2;
    }

    async ApplyCardReissue() {
        this.hideInfo = true; //重置眼睛顯示
        let selectedCard: { CardNo: string, ExpDate: string, CardTypeCode: string }[] = [];
        if (this.isLoss) {
            selectedCard.push(...this.selectPrimaryCardItem.map(({ CardNo, ExpDate, CardTypeCode }) => ({ CardNo, ExpDate, CardTypeCode })),
                ...this.selectAdditionalCardItem.map(({ CardNo, ExpDate, CardTypeCode }) => ({ CardNo, ExpDate, CardTypeCode }))
            );
        } else {
            this.ReissueCardItem.filter(e => e.CardNo === this.cardNo).map(x => selectedCard.push({ CardNo: x.CardNo, ExpDate: x.ExpDate, CardTypeCode: x.CardTypeCode }));
        }
        const response = await this.applyService.ApplyCardReissue({
            ID: this.idNumber,
            Type: this.isLoss ? '1' : '2',
            ProductCode: this.productCode,
            CardFace: this.cardFace,
            ReasonCode: this.isLoss ? null : this.damageForm.get('reason').value,
            AddressType: this.addressFlag ? this.addressForm.get('address').value : '0',
            Cards: selectedCard
        })
        if (ServiceHelper.ifSuccess(response)) {
            this.successDateTime = new Date(response.Result.ApplyDate)
            const cardList = response.Result.Items;
            this.displayAddressRs = response.Result.Address;
            this.AllSuccess = cardList.every(e => e.IsSuccess);
            this.AllFailStatus = cardList.every(e => !e.IsSuccess);
            if (this.AllSuccess) {
                this.selectedIndex = 3;
            } else if (this.AllFailStatus) {
                this.selectedIndex = 4;
            } else if (!this.AllFailStatus) { //部分失敗
                cardList.forEach(x => {
                    let item;
                    if (this.situation === 'FromCardLost') { //如果是card lose來源，取得card lose頁面選取的卡片資訊
                        item = this.cardReissueList.find(z => z.CardNo === x.CardNo);
                    } else {//取 QueryCardReissue 回傳的卡片資訊
                        item = this.ReissueCardItem.find(z => z.CardNo === x.CardNo);
                    }
                    const { CardTypeCode } = item;
                    if (CardTypeCode !== "NP") { //正卡
                        this.primaryCardResult.push({
                            CardNo: item.CardNo,
                            Name: item.Name,
                            CardBrand: item.CardBrand,
                            CardHolderName: item.CardHolderName,
                            IsSuccess: x.IsSuccess
                        });
                    } else {
                        this.additionalCardResult.push({
                            CardNo: item.CardNo,
                            Name: item.Name,
                            CardBrand: item.CardBrand,
                            CardHolderName: item.CardHolderName,
                            IsSuccess: x.IsSuccess
                        });
                    }
                });
                this.selectedIndex = 5;
            }
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
                this.router.navigateByUrl('/Account/CardManage');
            }
            return;
        }
        //call 換補發申請API 回傳申請日期後填入成功頁面
    }

    //回信用卡頁面
    backToLast() {
        this.router.navigate(['/Account/CardManage'], {
            state: {
                cardNo: this.cardNo
            }
        });
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    updateSelectedAddr(address: string = '') {
        this.confirmAddr = address;
    }

    scrollTop() {
        window.scroll(0, 0);
    }

    ngOnDestroy(): void {
        this.simpleModal.removeAll();
        clearInterval(this.otpInterval);
    }
    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }
}
