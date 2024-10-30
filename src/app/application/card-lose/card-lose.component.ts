import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { ApplyLostCardsRs, LostCard, LostCardItem } from 'src/app/shared/services/sinopac/apply.model';
import { GetAgreementInfoRs } from 'src/app/shared/services/sinopac/agreement.models';
import { AgreementService, ApplyService, AuthHelper, ServiceHelper, MemberService, CardReissueService } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';
import { AgreementCodes } from 'src/app/shared/services/sinopac/shared.model';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { CardStatus2Item } from 'src/app/shared/services/sinopac/member.models';
import { reissueType } from '../card-reissue/card-reissue.model';

@Component({
    selector: 'app-card-lose',
    templateUrl: './card-lose.component.html',
    styleUrls: ['./card-lose.component.scss']
})
export class CardLoseComponent implements OnInit {
    app = new AppWrapper();
    selectedIndex = 0;
    agreeNotice = false;
    idNumber = "";
    productCode = "";
    cardFace = "";
    sso: boolean;
    loseCardItem = {} as LostCard;
    cardBrand = "";
    currentDate = "";
    primarySelectedCards = []; // 主卡勾選狀態
    primaryCardItem = new Array<LostCardItem>(); // 主卡清單
    selectPrimaryCardItem = new Array<LostCardItem>(); // 勾選主卡清單
    additionalSelectedCards = []; // 副卡勾選狀態
    additionalCardItem = new Array<LostCardItem>(); // 附卡清單
    selectAdditionalCardItem = new Array<LostCardItem>(); // 勾選附卡清單
    applyLoseCardResult: ApplyLostCardsRs;
    applyLoseCardAllSuccessStatus = true; // 全部卡片掛失成功
    applyLoseCardAllFailStatus = true; // 全部卡片掛失失敗
    isVip = false;
    agreementData: GetAgreementInfoRs;
    agreementCodes = AgreementCodes;
    cardNo = "";
    confirmButton = false;
    hidePrimaryCardInfo = true;
    hideAdditionalCardInfo = true;
    showToCardReissue = false;
    cardLoseSuccessList = new Array<LostCardItem>();
    canReissueCards: CardStatus2Item[];
    /** 掛失卡片有效期限 */
    loseCardExpDate: string;

    public constructor(
        private applyService: ApplyService,
        private agreementService: AgreementService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: SimpleModalService,
        private memberService: MemberService,
        private cardReissueService: CardReissueService
    ) { }

    async ngOnInit() {
        this.app.initHeaderBack('線上掛失卡片資訊');
        this.sso = this.route.snapshot.data.Sso;
        this.idNumber = AuthHelper.CustomerId;
        this.productCode = history.state.productCode;
        this.cardFace = history.state.cardFace;
        this.cardNo = history.state.cardNo;
        if (this.sso) {
            this.getLoseCardList();
            this.getAgreementInfo();
        }
        this.msgDialoglistening();
        this.DateTimeFormat();
    }

    /**error msg dialog 監聽 */
    msgDialoglistening() {
        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'modifyAddr' && event.action === 0) {
                this.callCustomerServer();
            }
            if (event.id === 'modifyAddr' && event.action === 1) {
                this.backToLast()
            }
            if (event.id === 'RepeatApply' && event.action === 1) {
                this.callCustomerServer();
            }
            if (event.id === 'SystemError' && event.action === 1) {
                this.callCustomerServer();
            }
        });
    }

    DateTimeFormat() {
        var timeNow = new Date();
        var getYear = timeNow.getFullYear();
        var getMonth = (timeNow.getMonth())+1;
        var getDay = timeNow.getDate();
        this.currentDate = getYear+"-"+getMonth+"-"+getDay;
    }

    backToLast() {
        this.router.navigate(['/Account/CardManage'], {
            state: {
                cardNo: this.cardNo
            }
        });
    }

    nextStep() {
        this.selectedIndex++
    }

    selectedIndexChange() {
        if (this.selectedIndex == 1)
            this.app.initHeaderBack('線上掛失再次確認');
        if (this.selectedIndex == 2)
            this.app.initHeaderBack('線上掛失結果');
        window.scroll(0, 0)
    }

    changeSelectCardItems(i, cardTypeCode) {
        if (cardTypeCode != "NP") {
            this.additionalSelectedCards = new Array(this.additionalCardItem.length).fill(!this.primarySelectedCards[i]);
            this.primarySelectedCards = new Array(this.primaryCardItem.length).fill(!this.primarySelectedCards[i]);
        } else {
            this.additionalSelectedCards[i] = !this.additionalSelectedCards[i];
        }
        this.selectPrimaryCardItem = this.primaryCardItem.filter((e, i) => this.primarySelectedCards[i] && e.CardTypeCode != "NP")
        this.selectAdditionalCardItem = this.additionalCardItem.filter((e, i) => this.additionalSelectedCards[i] && e.CardTypeCode == "NP")
        this.confirmButton = this.selectPrimaryCardItem.length != 0 || this.selectAdditionalCardItem.length != 0 ? true : false;

    }

    canChangeAdditionalCard() {
        return !this.primarySelectedCards.every((e) => e);
    }

    checkSelectedLoseCard() {
        this.hidePrimaryCardInfo = true;
        this.hideAdditionalCardInfo = true;
        if (this.selectPrimaryCardItem.length != 0 || this.selectAdditionalCardItem.length != 0)
            this.selectedIndex++
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

    // 取得掛失卡片主附卡清單
    async getLoseCardList() {
        const response = await this.applyService.QueryLostCards({
            ID: this.idNumber,
            ProductCode: this.productCode,
            CardFace: this.cardFace
        });
        if (ServiceHelper.ifSuccess(response)) {
            this.loseCardItem = response.Result.Items[0];
            this.primaryCardItem = this.loseCardItem.Cards.filter((e) => e.CardTypeCode != "NP");
            this.additionalCardItem = this.loseCardItem.Cards.filter((e) => e.CardTypeCode == "NP");
            this.isVip = response.Result.IsVip;
            this.primarySelectedCards = new Array(this.primaryCardItem.length).fill(false);
            this.additionalSelectedCards = new Array(this.additionalCardItem.length).fill(false);
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
    }

    // 送出掛失申請
    async submit() {
        try {
            this.hidePrimaryCardInfo = true;
            this.hideAdditionalCardInfo = true;
            let cards = [...this.primaryCardItem.reduce((prev, curr, i) => this.primarySelectedCards[i] ? [...prev, curr.CardNo] : prev, []),
            ...this.additionalCardItem.reduce((prev, curr, i) => this.additionalSelectedCards[i] ? [...prev, curr.CardNo] : prev, [])]
            const response = await this.applyService.ApplyLostCards({
                ID: this.idNumber,
                Cards: cards
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.applyLoseCardResult = response.Result;
                this.checkApplyLoseCardStatus();
                const cardStatus2response = await this.memberService.CardStatus2({ ID: AuthHelper.CustomerId });
                if (ServiceHelper.ifSuccess(cardStatus2response)) {
                    this.cardLoseSuccessList = this.applyLoseCardResult.Cards.filter(x => cards.includes(x.CardNo) && x.IsSuccess);//從申請掛失回傳找那張卡號且掛失成功，組成List
                    this.canReissueCards = cardStatus2response.Result.Items.filter((orig) => {
                        return this.cardLoseSuccessList.some((sucItem) => {
                            return (sucItem.ProductCode === orig.ProductCode && sucItem.CardFace === orig.CardFace) //cardstatus2不會有附卡資訊，所以使用cardFaceID去找主卡看是否可換補發
                                && orig.Reissue !== "1" && orig.Reissue !== "3"// 1:不可掛補  3:不可掛補及毀補
                        })
                    }) //找出可以掛失補發的卡片
                    if (this.canReissueCards.length > 0) {
                        this.showToCardReissue = true;
                    } else {
                        this.showToCardReissue = false;
                    }
                    this.selectedIndex++
                } else {
                    //CardStatus2有錯不要顯示error，不要顯示補發卡片按鈕即可
                    this.showToCardReissue = false;
                }
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
                    this.router.navigateByUrl('/Account/CardManage');
                }
                return;
            }
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 取得合約注意事項
    async getAgreementInfo() {
        try {
            const response = await this.agreementService.getAgreementInfo({ Title: this.agreementCodes.creditCardLoseAgreement, Source: "CAWHO" });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.agreementData = response.Result;
                // 秀出條款
                const agree = await this.modalService
                    .addModal(NoticeDialogComponent, {
                        Title: '信用卡掛失注意事項',
                        Source: 'CAWHO',
                        NoticeMatter: '永豐商業銀行信用卡掛失注意事項',
                        NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                        color: urlColor.None,
                    })
                    .toPromise();
                if (!agree) {
                    this.backToLast();
                }
            }
            else {
                let swal = Swal.fire({
                    text: "系統維護中，請稍後再試！", icon: 'error', confirmButtonText: '確定',
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
        }
        catch (error) {
            console.log(error);
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 寫入合約版號
    async insertAgreementRecord() {
        try {
            await this.agreementService.insertAgreementRecord({
                ID: this.idNumber,
                Title: this.agreementData.Title,
                Version: this.agreementData.Version,
                Source: "CAWHO"
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    checkApplyLoseCardStatus() {
        this.applyLoseCardAllSuccessStatus = this.applyLoseCardResult.Cards.every((e) => e.IsSuccess)
        this.applyLoseCardAllFailStatus = this.applyLoseCardResult.Cards.every((e) => !e.IsSuccess)
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }
    //前往換補發
    async goCardReissue() {
        if (this.canReissueCards.every(a => a.AddrMaint !== 'Y')) {//無更動過地址，導頁至換補發
            if (this.cardReissueService.checkRepeatApply(this.idNumber, this.cardLoseSuccessList, reissueType.Loss,'FromCardLost'))
                return;
        } else {//有更動過地址，跳無法申請Dialog
            this.app.showMsgSelDialog(
                {
                    id: 'modifyAddr',
                    title: '無法申請補發',
                    msg: '無法進行線上補發，請聯繫客服進行補發卡片申請作業。',
                    btnOK: '聯絡客服', btnNO: '取消申請'
                });
        }
    }
}
