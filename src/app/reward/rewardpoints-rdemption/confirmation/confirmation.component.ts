import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { RewardPointSensorsTrack } from 'src/app/shared/services/sensorsdata';
import { GiftExchangeItem, GiftItem } from 'src/app/shared/services/sinopac/bouns.models';
import { Address2 } from 'src/app/shared/services/sinopac/data.models';
import { RewardDataService } from 'src/app/shared/services/sinopac/reward-data.service';
import { AuthHelper, BonusService, DataService, MemberService, ServiceHelper } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-rewardpoints-rdemption-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
    private readonly app = new AppWrapper();
    /** 顯示資訊 */
    addressHide = true;
    /** 所有商品 */
    Gifts: GiftItem[];
    /** 目前兌換總計 */
    pointNow: number = 0;
    /** 全部點數 */
    pointAll: number = 0;
    /** 目前選擇商品 */
    giftSelecd: GiftItem[];
    /** 商品寄送地 */
    sendAddres: string;
    /** 商品寄送郵遞區號 */
    sendZipCode: string;
    /** 全部縣市、地區 */
    zipCode: Address2[];
    /** 縣市下拉 */
    optionsCity: Array<string>;
    /** 鄉鎮區域下拉 */
    optionsArea: Array<string>;
    form: FormGroup;

    get SameAddress() {
        return this.form.get('isSameAddress') as FormControl;
    }
    get City() {
        return this.form.get('addressCity') as FormControl;
    }
    get Area() {
        return this.form.get('addressArea') as FormControl;
    }
    get AddressInput() {
        return this.form.get('addressInput') as FormControl;
    }
    get AddressInputHide() {
        return this.form.get('addressInputHide') as FormControl;
    }

    constructor(
        private router: Router,
        private bonusSer: BonusService,
        private rewardDataSer: RewardDataService,
        private dataSer: DataService,
        private memberSer: MemberService,
    ) { }

    ngOnInit() {
        document.body.classList.add('rewardPointsAddress');
        this.app.initHeaderBackWithCustomerService('紅利兌換');
        this.getGifts();
        this.getCity();
        this.buildForm();
    }

    /** 商品兌換列表 */
    getGifts() {
        document.body.classList.remove('rewardPointsAddress');
        this.Gifts = this.rewardDataSer.getGifts;
        this.pointAll = this.rewardDataSer.getPoint?.Result.Point;
        this.pointNow = this.Gifts?.filter(x => x.qty > 0).reduce((sum, item) => sum + (Number(item.Point) * item.qty), 0);
        this.giftSelecd = this.Gifts?.filter(x => x.qty > 0);
    }

    // 建立表單
    buildForm() {
        this.form = new FormGroup({
            isSameAddress: new FormControl(true),
            addressCity: new FormControl('', [Validators.required]), // 寄送縣市
            addressArea: new FormControl('', [Validators.required]), // 寄送城鎮
            addressInput: new FormControl('', [Validators.required]), // 寄送地址
            addressInputHide: new FormControl('', [Validators.required]), // 寄送地址隱碼
        });
    }

    /** 取下拉縣市 */
    async getCity() {
        try {
            const response = await this.dataSer.TWZip3Code({
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.zipCode = response.Result.Items;
                this.optionsCity = [...new Set(this.zipCode.map(item => item.City))];
            }
            this.GetContactInfo();
        } catch (error) {
            console.log(error);
        }
    }

    /** 取下拉區域 */
    getArea() {
        this.Area.setValue('');
        this.optionsArea = this.zipCode.filter(item => item.City === this.City.value).map(item => item.Area);

    }

    /** 切換同現居/通訊地址*/
    sameSwitch() {
        if (this.SameAddress.value && (this.sendZipCode || this.sendAddres)) {
            this.addressDisable();
            this.addressReset();
            this.AddressInputHide.setValue(this.sendAddres);
            const zip = this.zipCode?.find(x => x.ZipCode === this.sendZipCode?.substring(0, 3));
            if (zip) {
                this.City.setValue(zip.City);
                this.optionsArea = this.zipCode.filter(item => item.City === this.City.value).map(item => item.Area);
                this.Area.setValue(zip.Area);
                this.AddressInputHide.setValue(this.sendAddres.replace(zip.City, '').replace(zip.Area, ''));
            }
            this.addressSet();
        }
        else {
            this.SameAddress.setValue(false);
            this.addressEnable();
            this.addressReset();
        }
    }

    /** 地址重設 */
    addressReset() {
        this.City.setValue("");
        this.Area.setValue("");
        this.AddressInputHide.setValue("");
        this.AddressInput.setValue("");
    }

    /** 啟用編輯地址 */
    addressEnable() {
        this.City.enable();
        this.Area.enable();
        this.AddressInput.enable();
        this.AddressInputHide.enable();
    }

    /** 停用編輯地址 */
    addressDisable() {
        this.City.disable();
        this.Area.disable();
        this.AddressInput.disable();
        this.AddressInputHide.disable();
    }

    /** 設定地址隱碼 */
    addressSet() {
        if (this.addressHide) {
            this.AddressInput.setValue(this.AddressInputHide.value);
        }
        else
            this.AddressInput.setValue('*'.repeat(this.AddressInputHide.value.length));
    }

    /** 顯示地址 */
    adressfocus() {
        this.AddressInput.setValue(this.AddressInputHide.value);
    }

    /** 設定地址 */
    addressblur() {
        this.AddressInputHide.setValue(this.AddressInput.value);
        this.addressSet();
    }

    /** 取下拉縣市 */
    async GetContactInfo() {
        try {
            const response = await this.memberSer.GetContactInfo({
                ID: AuthHelper.CustomerId
            })
            if (ServiceHelper.ifSuccess(response, false)) {
                this.sendAddres =
                    response.Result.AddrInd == '1'
                        ? response.Result.HomeAddress
                        : response.Result.AddrInd == '2'
                            ? response.Result.CompanyAddress
                            : response.Result.ResidenceAddress;
                this.sendZipCode =
                    response.Result.AddrInd == '1'
                        ? response.Result.HomeZip
                        : response.Result.AddrInd == '2'
                            ? response.Result.CompanyZip
                            : response.Result.ResidenceZip;
                this.sameSwitch();
            }
        } catch (error) {
            console.log(error);
        }
    }

    // 確認兌換Btn
    async submit() {
        if (this.City.value && this.Area.value && this.AddressInputHide.value) {
            try {
                //神測埋點
                const sensorData = this.giftSelecd.map(gift => {
                    return {
                        exchange_name: gift.Name,
                        exchange_amount: gift.qty
                    }
                })

                const Dictionaryexample: { [key: string]: string } = {};

                for (const key in sensorData) {
                    Dictionaryexample[key] = String(sensorData[key]);
                }

                RewardPointSensorsTrack("ExchangeConfirm", sensorData);
                const items: GiftExchangeItem[] = this.giftSelecd.map(item => {
                    return {
                        ProjCode: item.ProjectNo,
                        ProdCode: item.GiftNo,
                        Quantity: item.qty,
                        EndTime: item.EndTime,
                        Description: item.Description,
                        TotalPoints: item.Point * item.qty,
                        SendType: item.SendType
                    }
                })
                const response = await this.bonusSer.GiftExchange({
                    ID: AuthHelper.CustomerId,
                    Items: items,
                    Address: this.City.value + this.Area.value + this.AddressInputHide.value
                })
                this.rewardDataSer.setGiftExchange = response;
                this.router.navigateByUrl('/Reward/RewardPointsRdemption/Result');
            } catch (error) {
                console.log(error);
            }
        }
        else {
            this.SameAddress.setValue(false);
            this.addressEnable();
            this.app.showMsgDialog({ id: '', title: '請完整填寫商品寄送地址', msg: '商品寄送地址不能空著唷，請完整填寫縣市、區域及地址。' });
        }
    }

    /** 商品兌換列表 */
    exchangeList() {
        document.body.classList.remove('rewardPointsAddress');
        this.router.navigateByUrl('/Reward/RewardPointsRdemption/Cart');
    }

    /** 是否有實體商品 */
    public isExchangeAnyRealProduct() {
        return this.Gifts?.filter(x => x.qty > 0)?.some(t => t.SendType === "M");
    }
}
