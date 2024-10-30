import { DataService } from './../../shared/services/sinopac/data.service';
import { AccountService, AuthHelper, ServiceHelper, } from 'src/app/shared/shared.module';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { ApplyCardsInfo, GetTemporaryCreditInfoRs, } from 'src/app/shared/services/sinopac/account.models';
import AlertHelper from 'src/app/shared/helpers/alert.helper';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { RadioboxDialogComponent } from '../shared/dialog/radiobox-dialog/radiobox-dialog.component';

@Component({
    selector: 'app-temp-cli',
    templateUrl: './temp-cli.component.html',
    styleUrls: ['./temp-cli.component.scss'],
})
export class TempCliComponent implements OnInit, OnDestroy {
    private readonly app = new AppWrapper();
    public form!: FormGroup;
    selectedIndex = 0;
    public datareason: string;
    public res: GetTemporaryCreditInfoRs;
    public raiseAmount: number; // 申請增加信用額度
    public cardList: { Name: string; No: string, Desc: string }[] = []; // 名稱、卡號 For顯示
    public Reason: string; // 選擇原因
    public RefNo = '';
    public cards: Array<ApplyCardsInfo>;
    public NoList = []; // 卡號 For API
    public CardTypeList: {CardNo:string,CardTyp:string}[] = []; //卡號、卡別
    public applyStatus: string;
    public applyFinish: boolean;
    public ShowTel: string;
    /**原始信用額度 */
    private origCredit: number;
    failCode: string;
    public eyeOpen: boolean = false;

    constructor(
        private fb: FormBuilder,
        public accountService: AccountService,
        public datepipe: DatePipe,
        public dataService: DataService,
        private modalService: SimpleModalService
    ) { }

    get contact() {
        return this.form.get('applyInfo.contact') as FormControl;
    }

    get ApplyReason() {
        return this.form.get('applyInfo.reason') as FormControl;
    }

    get ApplyDes() {
        return this.form.get('applyInfo.illustrate') as FormControl;
    }

    get Other() {
        return this.form.get('applyInfo.contactOther') as FormControl;
    }

    get DateEnd() {
        return this.form.get('applyInfo.dataEnd') as FormControl;
    }

    get DateStart() {
        return this.form.get('applyInfo.dataStart') as FormControl;
    }

    get AddCredits() {
        return this.form.get('info.credits') as FormControl;
    }

    get applyCard() {
        return this.form.get('applyCard') as FormArray;
    }

    async ngOnInit(): Promise<void> {
        this.setTitleWithBack();
        this.form = this.fb.group({
            info: this.fb.group({
                credits: [null, Validators.required], //信用額度
            }),
            applyCard: this.fb.array([]),
            applyInfo: this.fb.group({
                dataStart: [''],
                dataEnd: ['', Validators.required],
                reason: ['', Validators.required],
                illustrate: ['', Validators.required], //說明原因
                contact: ['Phone'],
                contactOther: [''],
            }),
        });
        // 打API取得信用卡臨時額度調整資料
        try {
            const response = await this.accountService.getTemporaryCreditInfo({
                ID: AuthHelper.CustomerId,
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.res = response.Result;
                this.raiseAmount = Number(this.res.AvailableCredit);
                this.DateStart.setValue(this.dateFmt(this.res.BeginDate));
                this.DateEnd.setValue(this.dateFmt(this.res.DefaultEndDate));
                this.cards = this.sortCards(response.Result.ApplyCards);
                this.origCredit = Number(response.Result.OriginalCredit);
                for (const card of this.cards) {
                    this.applyCard.push(this.fb.control(true));
                }
            } else {
                AlertHelper.showErrorAndExitWebView(response.ResultMessage);
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        this.scrollTop();
    }

    scrollTop() {
        window.scroll(0, 0);
    }

    sortCards(cards: ApplyCardsInfo[]): ApplyCardsInfo[] {
        let newSort: ApplyCardsInfo[] = [];
        cards.forEach((card) => {
            //換主卡名稱
            if (card.CardTypeDesc === '主卡') {
                card.CardTypeDesc = '正卡';
            }
            //排序正附卡
            if (card.CardTypeCode !== 'NP') {// !='NP'=>正卡
                newSort.push(card);
                const cardGroupNum = card.CardFace + card.ProductCode;
                cards.forEach((card2) => {
                    if (card2.CardFace + card2.ProductCode === cardGroupNum
                        && card2.CardTypeCode === 'NP') {
                        newSort.push(card2);
                    }
                });
            }
        });
        return newSort;
    }

    async submit() {
        this.cardList = [];
        this.NoList = [];
        //驗證欄位、驗證表單
        if (!(this.Validate())) {
            return;
        }
        if (!(this.isMainNoChoice())) {
            ServiceHelper.showError('附卡臨時信用額度，需連同正卡一併調高。');
            return;
        }
        if (await this.Holiday(this.DateEnd.value)) {
            return;
        }
        this.ShowTel = this.contact.value === 'Phone' ? this.res.ContactMobile : this.Other.value;
        // 取得勾選卡片資訊
        for (let i = 0; i < this.applyCard.value.length; i++) {
            if (this.applyCard.value[i] === true) {
                this.cardList.push({
                    Name: this.cards[i].Name,
                    No: this.cards[i].CardNo.slice(-4),
                    Desc: this.cards[i].CardTypeDesc
                });
                this.NoList.push(this.cards[i].CardNo);
                this.CardTypeList.push({CardNo:this.cards[i].CardNo, CardTyp:this.cards[i].ProductCode+this.cards[i].CardFace})
            }
        }
        // 條款
        const agree = await this.modalService
            .addModal(NoticeDialogComponent, {
                Title: '申請提高臨時信用額度注意事項',
                Source: 'CAWHO',
                NoticeMatter: '永豐商業銀行提高臨時信用額度注意事項',
                NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                color: urlColor.None,
            })
            .toPromise();
        if (agree) {
            this.selectedIndex++;
            this.setTitleWithBack();
        }
    }

    /** 申請原因 */
    async openreson() {
        const list: { name: string; value: string; dec: string }[] = [
            {
                name: '出國',
                value: '01',
                dec: '出國：請簡述出國目的地及時間，用途為機票住宿或是國外消費使用。例：5/2~5/8、 日本、機票及國外購物。',
            },
            {
                name: '搬家',
                value: '02',
                dec: '搬家：請簡述用途為購屋訂金或是裝潢或添購家具….等。例：房屋訂金。',
            },
            {
                name: '結婚',
                value: '03',
                dec: '結婚：請簡述用途為飯店宴客、或結婚用品(如首飾、喜餅)之購買。例：XX飯店喜宴費用。',
            },
            {
                name: '公務',
                value: '04',
                dec: '公務：請簡述用途為出差費用或先幫公司代墊之項目。例：XX飯店會議室預訂之費用。',
            },
            {
                name: '其他',
                value: '05',
                dec: '其他：若選項中無適合之項目，請簡單說明臨調用途。例：百貨公司周年慶。',
            },
            {
                name: '繳稅',
                value: '06',
                dec: '繳稅：請說明繳納之稅款類別，如所得稅、房屋地價稅、燃料牌照稅….等，並請說明需繳納之約略金額。例：所得稅，約25萬。',
            },
        ];
        const result = await this.modalService
            .addModal(RadioboxDialogComponent, {
                title: '請選擇原因',
                list,
                filter: false,
                value: this.form.get('applyInfo.reason')?.value,
            })
            .toPromise();
        if (result) {
            const item = list.find((a) => a.value === result);
            this.Reason = item.name;
            this.form.get('applyInfo.reason')?.setValue(item.value);
            this.datareason = item.dec;
        }
    }

    // 申請增加信用額度 change事件
    Change() {
        this.raiseAmount =
            Number(this.res.AvailableCredit) + Number(this.AddCredits.value);
    }

    Validate(): boolean {
        if (this.AddCredits.invalid) {
            ServiceHelper.showError('請輸入申請增加額度');
            return false;
        } else if (Number(this.AddCredits.value) > 1500000) {
            ServiceHelper.showError('網路申請信用卡臨時額度調整，申請增加之信用額度，最高以新臺幣 150 萬元為限，若需申請更高額度請洽客服中心 (02) 2528-7776。');
            return false;
        } else if (Number(this.AddCredits.value) % 1000 > 0) {
            ServiceHelper.showError('申請增加額度請以仟元為單位');
            return false;
        } else if (Number(this.AddCredits.value) < 0) {
            ServiceHelper.showError('申請增加額度不可輸入負值');
            this.AddCredits.setValue(undefined);
            return false;
        } else if (Number(this.AddCredits.value) === 0) {
            ServiceHelper.showError('申請增加額度不能輸入0');
            this.AddCredits.setValue(undefined);
            return false;
        } else if (
            this.applyCard.value.filter((item) => item === true).length === 0
        ) {
            ServiceHelper.showError('至少勾選一張卡');
            return false;
        } else if (
            this.DateEnd.invalid ||
            this.more60Day(this.DateStart.value, this.DateEnd.value)
        ) {
            ServiceHelper.showError(
                '申請迄日需晚於申請起日（不可超過60天），且不可為假日，請重新輸入，謝謝。'
            );
            return false;
        } else if (this.ApplyReason.invalid) {
            ServiceHelper.showError('請選擇申請原因');
            return false;
        } else if (this.ApplyDes.invalid) {
            ServiceHelper.showError('請填寫申請說明(必填)');
            return false;
        } else if (this.Other.invalid) {
            ServiceHelper.showError('請輸入聯絡方式');
            return false;
        }
        return true;
    }

    /**
     * 檢核申請迄日是否為假日API
     * @param dateE 申請日期迄
     * @returns
     */
    async Holiday(dateE: string): Promise<boolean> {
        const DateE = this.transform(this.dateFmt(dateE), '-');
        // 打假日API
        try {
            const isHoliday = await this.dataService.checkIsHoliday({
                QueryDate: new Date(DateE),
            });
            if (ServiceHelper.ifSuccess(isHoliday, false)) {
                if (isHoliday.Result.IsHoliday) {
                    ServiceHelper.showError('申請迄日需晚於申請起日（不可超過60天），且不可為假日，請重新輸入，謝謝。'
                    );
                    return true;
                }
            }
            else {
                ServiceHelper.showError(isHoliday.ResultMessage);
                return true;
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        return false;
    }

    /**
     * 判別已選取附卡是否有選主卡
     */
    isMainNoChoice(): boolean {
        let mainChoice = true;
        for (let i = 0; i < this.applyCard.value.length; i++) {
            if (this.applyCard.value[i] && this.cards[i].CardTypeCode === 'NP') {
                /**附卡的group num */
                const groupNum = this.cards[i].CardFace + this.cards[i].ProductCode//
                const mainCardIdx = this.cards.findIndex(card =>
                    card.CardFace + card.ProductCode === groupNum && card.CardTypeCode !== 'NP'
                );
                if (!(this.applyCard.value[mainCardIdx])) {
                    mainChoice = false;
                    break;
                }
            }
        }
        return mainChoice;
    }

    more60Day(dateS: Date, dateE: Date): boolean {
        const StartVaule = new Date(dateS);
        const EndVaule = new Date(this.dateFmt(dateE));
        const next30days = new Date(
            new Date(dateS).setDate(new Date(dateS).getDate() + 60)
        );
        // 不合法的起迄日： 申請起日>=申請迄日、申請迄日>申請起日 + 60天
        if (StartVaule >= EndVaule || EndVaule > next30days) {
            return true;
        }
        return false;
    }

    // 2022/07/02 --> 2022-07-02
    transform(value: string, mark: string): string {
        const [year, month, day] = value.split('/');
        return [year, month, day].join(mark);
    }

    async apply() {
        try {
            const response = await this.accountService.applyTemporaryCredit({
                ID: AuthHelper.CustomerId,
                CardNoList: this.NoList,
                RegionCode: 'B', //比照卡網寫死'B'
                ReasonCode: this.ApplyReason.value,
                ReasonDesc: this.ApplyDes.value,
                AdjutLimit: (this.origCredit + Number(this.AddCredits.value)).toString(),
                EffDate: this.DateStart.value,
                ExpDate: this.dateFmt(this.DateEnd.value),
                Tel: this.ShowTel,
                AddCredits: Number(this.AddCredits.value).toString(),
                CardTypeList: this.CardTypeList,
            });
            this.setTitle();
            if (ServiceHelper.ifSuccess(response, false)) {
                if (response.Result.Success) {
                    this.applyStatus = '申請成功';
                    this.applyFinish = false;
                } else {
                    this.applyStatus = '申請完成';
                    this.applyFinish = true;
                }
                this.RefNo = response.Result.RefNo;
                this.eyeOpen = false;
                this.selectedIndex++;
            } else {
                this.applyStatus = '申請失敗';
                this.failCode = response.ResultCode;
                this.selectedIndex = 3;
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 聯絡客服
    callCustomerServer() {
        this.app.showCustomerService();
    }

    exit() {
        this.app.exitWeb();
    }

    /**導到 信用卡帳務-未出帳 */
    goCardManage() {
        this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
    }

    /**
     * 日期轉換
     * @param date  20170615
     * @returns 2017/06/15
     */
    dateFmt(date: any): any {
        return date.replace(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2}).*/gi, '$1/$2/$3');
    }

    setTitleWithBack(): void {
        this.app.initHeaderBack('信用卡臨時額度調整');
    }

    setTitle(): void {
        this.app.initHeaderMenu('信用卡臨時額度調整');
    }

    ngOnDestroy(): void {
        this.modalService.removeAll();
    }
}
