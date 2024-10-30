import { AddressListDialogComponent } from './../shared/dialog/address-list-dialog/address-list-dialog.component';
import { RadioboxDialogComponent } from './../shared/dialog/radiobox-dialog/radiobox-dialog.component';
import { AccountService, AuthHelper, LoaderService, ServiceHelper, SharedService } from 'src/app/shared/shared.module';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FileItem, FileLikeObject, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import Swal from 'sweetalert2';
import { SimpleModalService } from 'ngx-simple-modal';
import { NoticeDialogComponent, urlColor } from 'src/app/shared/dialog/notice-dialog/notice-dialog.component';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { MyDataDoRequestModel, MyDataLoginRequestModel, MyDataLoginResponseModel } from 'src/app/shared/services/sinopac/shared.model';
import AlertHelper from 'src/app/shared/helpers/alert.helper';
import { GetPermanentCreditInfoRs } from 'src/app/shared/services/sinopac/account.models';
import { objectToEncryptString } from 'src/app/shared/services/sinopac/shared.service';

@Component({
    selector: 'app-perm-cli',
    templateUrl: './perm-cli.component.html',
    styleUrls: ['./perm-cli.component.scss'],
})
export class PermCliComponent implements OnInit, OnDestroy {
    isHouseFun: boolean;
    form1: FormGroup;
    public res: GetPermanentCreditInfoRs;
    uploaders = new Array<FileUploader>(1); //存放財力證明上傳檔
    img_name: Array<string> = new Array(); // 財力證明圖片名稱
    allowedMimeType: string[] = ['image/jpeg', 'image/tiff', 'image/png'];
    type: string = '0';
    sso = false;
    private tempFileIds = new Array();
    public uploadCount: number = 0;
    selectedIndex = 0; //頁面控制

    //step 1
    originamount: string; //原始信用額度
    finalamount: number = 0; // 信用額度加總
    FinancialProofType: number = 0; // 財務證明項目
    CompanyAddr: string; //財力證明  不動產地址
    IsFinancialCustomer: boolean //是否為永豐銀行理財客戶 flag
    disabledText = false; // 申請原因-其他文字輸入欄控制
    ReasonCode: any; //申請原因 - 代號
    LandRegisterAddressType: number; //不動產謄本地址別 同現居地：1,同戶籍地：2,其他：3
    birthday: string; //生日 myData 用
    AttachmentRefs: any; //上傳附件
    AddressType: number;
    selectedAddrCode: string; //不動產dailog跳窗選擇回傳的value
    manualinputAddr: boolean = false; // 不動產地址 自行輸入控制flag
    /**現居地址 */
    homeAddr: string;
    /**戶籍地址 */
    residentAddr: string;

    //step 3
    RefNo: string; //交易編號
    goMyData: boolean = false; //開啟前往MyData 視窗
    ifsuccessdo: boolean = false; //申請後成功、失敗頁面切換flag
    private readonly app = new AppWrapper();
    mydataForm: MyDataLoginResponseModel;
    hideUploadBtn = true;
    hideUploadBlock = false;

    //step 4
    failCode: string;

    constructor(
        private fb: FormBuilder,
        public accountService: AccountService,
        private loader: LoaderService,
        private simpleModal: SimpleModalService,
        private sharedService: SharedService,
    ) {
        //表單form1驗證 step1
        this.form1 = this.fb.group({
            info: this.fb.group({
                credits: [null, Validators.required], //申請信用額度
                mechanism: [null, Validators.nullValidator], //輸入服務機構
                reason: [null, Validators.required], //申請原因輸入欄
                illustrate: [null, Validators.required], //申請原因-其他 輸入欄位
            }),
            prove: this.fb.group({
                companyaddr: [null, Validators.nullValidator], //上傳財力證明 -不動產地址欄位
            }),
        });
    }

    async ngOnInit(): Promise<void> {
        this.app.initHeaderBack('永久信用額度調整');
        try {
            const response = await this.accountService.getPermanentCreditInfo({
                ID: AuthHelper.CustomerId,
                SmsType: 0,
            }); //SmsType在大咖app中固定回傳0
            if (ServiceHelper.ifSuccess(response, false)) {
                this.res = response.Result;
                // 初始化 uploaders
                for (let i = 0; i < this.uploaders.length; i++) {
                    this.newUploaders(i);
                }
                this.originamount = this.res.OriginalCredit.toString();
                this.finalamount = Number(this.originamount);
                this.birthday = this.res.Birthday;
                this.homeAddr = this.res.HomeAddress;
                this.residentAddr = this.res.ResidentAddress;
            } else if (response.ResultCode === '02') { //今日已申請過
                this.selectedIndex = 4;
                return;
            } else {
                AlertHelper.showErrorAndExitWebView(response.ResultMessage);
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        this.scrollTop();
    }

    //表單驗證 step1
    get AddCredits() {
        return this.form1.get('info.credits') as FormControl;
    }
    get AddMechanism() {
        return this.form1.get('info.mechanism') as FormControl;
    }
    get ApplyReason() {
        return this.form1.get('info.reason') as FormControl;
    }
    get ApplyIllustrate() {
        return this.form1.get('info.illustrate') as FormControl;
    }
    get AddCompanyAddr() {
        return this.form1.get('prove.companyaddr') as FormControl;
    }

    //表單驗證錯誤訊息 step1
    async Validate(): Promise<boolean> {
        if (this.AddCredits.invalid) {
            ServiceHelper.showError('請輸入申請增加額度');
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
        } else if (this.ApplyReason.invalid) {
            ServiceHelper.showError('請選擇申請原因');
            return false;
        } else if (this.ApplyIllustrate.invalid) {
            ServiceHelper.showError('請填寫說明原因');
            return false;
        } else if (this.AddCompanyAddr.invalid) {
            ServiceHelper.showError('請輸入不動產謄本地址');
            return false;
        } else if (this.FinancialProofType === 0) {
            ServiceHelper.showError('請選擇財力證明類型');
            return false;
        } else if (
            this.img_name.length === 0 &&
            this.FinancialProofType === 2
        ) {
            ServiceHelper.showError('請上傳財力證明');
            return false;
        }
        return true;
    }

    //submit step1
    async submit() {
        if (!(await this.Validate())) {
            return;
        }
        this.IsFinancialCustomer = (this.FinancialProofType === 1); //step2 財力證明顯示時會使用到
        if (this.FinancialProofType !== 2) {
            this.cleanUpload();
        }
        if (this.FinancialProofType !== 3) {
            this.AddressType = undefined;
            this.AddCompanyAddr.setValue(undefined);
        }
        const isAgree = await this.simpleModal
            .addModal(NoticeDialogComponent, {
                Title: '申請提高永久信用額度注意事項',
                Source: 'CAWHO',
                NoticeMatter: '永豐商業銀行提高永久信用額度注意事項',
                NoticeContent: '本人已詳閱【@&&】並已充分了解且同意遵守全部內容。',
                color: urlColor.None,
            })
            .toPromise();
        if (isAgree) {
            this.selectedIndex = 1;
        }
    }

    //原始信用額度+申請增加信用額度 step1
    public amountaccumulated() {
        this.finalamount =
            Number(this.originamount) + Number(this.AddCredits.value);
    }

    scrollTop() {
        window.scroll(0, 0);
    }

    //上傳財力證明-不動產地址 動態表單驗證 step1
    financialprooftypeConform(TypeNumber: number) {
        this.FinancialProofType = TypeNumber;
        this.manualinputAddr = false; //重置關閉  不動產地址-自行輸入input
        if (TypeNumber !== 2) {
            this.cleanUpload()
        }
        if (TypeNumber === 3) {
            this.AddCompanyAddr.setValue(undefined);
            this.AddCompanyAddr.setValidators(Validators.required);
            this.AddCompanyAddr.updateValueAndValidity();
        } else {
            this.AddCompanyAddr.setValidators(Validators.nullValidator);
            this.AddCompanyAddr.updateValueAndValidity();
        }
    }

    readUrl($event, uploader: FileUploader) {
        $('#upload-3').val('');
    }

    // 我要申請按鈕 step2
    async apply() {
        try {
            const response = await this.accountService.PermanentAdjustApply({
                ID: AuthHelper.CustomerId,
                OriginalCredit: this.originamount, //原始信用額度
                AdjustLimit: (Number(this.originamount) + Number(this.AddCredits.value)).toString(), //申請後調整額度
                ReasonCode: this.ReasonCode,
                ReasonDesc: this.ApplyIllustrate.value,
                Company: this.AddMechanism.value,
                IsFinancialCustomer: this.IsFinancialCustomer,
                AttachmentRefs: this.tempFileIds,
                SmsType: 0, //SmsType在大咖app中固定回傳0
                FinancialProofType: this.FinancialProofType,
                LandRegisterAddressType: this.AddressType, //不動產謄本地址別
                LandRegisterAddress: this.AddCompanyAddr.value,
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.app.initHeaderBack('永久信用額度調整');
                this.RefNo = response.Result.RefNo;
                this.selectedIndex = 2;
            } else {
                this.failCode = response.ResultCode;
                this.selectedIndex = 3;
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
    }

    // 移除上傳圖片
    remove(img_index?: number) {
        this.img_name.splice(img_index, 1);
        $('#upload-3').val('');
        this.uploaders[0].queue.splice(img_index, 1);
        this.tempFileIds.splice(img_index, 1);
    }

    /**
     * 設定uploaders
     */
    newUploaders(i: number) {
        const queueLimit = 10;
        this.uploaders[i] = new FileUploader({
            url: 'api/Account/UploadPermanentCreditAttachment',
            authToken: 'Bearer ' + AuthHelper.WebToken,
            method: 'POST',
            autoUpload: true, // 自動上傳
            maxFileSize: 5 * 1024 * 1024,
            allowedMimeType: this.allowedMimeType,
            queueLimit: queueLimit,
            itemAlias: 'File',
            additionalParameter: {
                ID: AuthHelper.CustomerId,
            },
        });
        this.uploaders[i].onAfterAddingFile = this.onAfterAddingFile.bind(
            this,
            i
        );
        this.uploaders[i].onBeforeUploadItem = this.onBeforeUploadItem.bind(
            this,
            i
        );
        this.uploaders[i].onSuccessItem = this.onSuccessItem.bind(this, i);
        this.uploaders[i].onWhenAddingFileFailed =
            this.onWhenAddingFileFailed.bind(this, i);
    }
    // 添加一個單獨的文件後觸發
    onAfterAddingFile(fileItem: FileItem) { }

    // 上傳一個文件對象之前觸發
    onBeforeUploadItem(index: number, fileItem: FileItem): any {
        this.loader.display(true);
    }

    // 添加一個文件失敗後觸發
    onWhenAddingFileFailed(index: number, item: FileLikeObject, filter: any, options: any) {
        this.loader.display(false);
        $('#upload-3').val('');
        let error_content = '';
        switch (filter.name) {
            case 'fileSize':
                error_content = '單一檔案不得超過5MB';
                break;
            case 'mimeType':
                error_content =
                    '檔案格式不符，請提供檔案格式為png、jpg、jpeg、tiff';
                break;
            case 'queueLimit':
                error_content = '檔案不得超過10個';
                break;
            default:
                break;
        }

        Swal.fire({
            text: error_content,
            icon: 'error',
            confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster',
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster',
            },
        });
    }

    // 一個文件上傳成功後觸發
    onSuccessItem(index: number, item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        this.loader.display(false);
        const res = JSON.parse(response);
        if (status === 200 && res.Success) {
            if (
                res.ReferenceNo !== null &&
                res.ReferenceNo !== ''
            ) {
                this.tempFileIds.push(res.ReferenceNo);
                this.img_name.push(item._file.name);
                this.uploadCount++; // 計算成功上傳(UploadFile)的數量
            }
        }
    }

    /**
     * 清空上傳檔案名稱、file id
     */
    cleanUpload() {
        this.tempFileIds = [];
        this.img_name = [];
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }

    exit() {
        this.app.exitWeb();
    }

    /**導到 信用卡帳務-未出帳 */
    goCardManage() {
        this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
    }

    async DoMyData() {
        try {
            const success = await this.getMyDataLoginToken();
            if (success) {
                this.goMyData = true;
            } else {
                ServiceHelper.showError('系統整理中，請稍後再試');
            }
        } catch (error) { }
    }

    async getMyDataLoginToken() {
        const model = {
            ID: AuthHelper.CustomerId,
            Birthday: this.birthday,
            FunctionCode: 3,
            IsMobile: true, //大咖app直接帶 true
        } as MyDataLoginRequestModel;
        try {
            const response = await this.sharedService.mydataLogin(model);
            if (ServiceHelper.ifSuccess(response)) {
                this.mydataForm = response.Result;
                return true;
            } else {
                AlertHelper.showErrorAndExitWebView(response.ResultMessage);
            }
        } catch (error) {
            ServiceHelper.showError('系統發生錯誤，請稍後再試！');
        }
        return false;
    }

    async postMydata() {
        const model = {
            VerifyNo: this.mydataForm.VerifyNo,
        } as MyDataDoRequestModel;
        await this.sharedService.mydataDo(model);

        let loginData = objectToEncryptString(this.mydataForm);
        location.href = `${window['site_config'].site_url}Application/MyDataRelay?do=${loginData}#open-browser`;
    }

    async openApplyReason() {
        //申請原因 step1
        const list: { name: string; value: string }[] = [
            { name: '出國', value: '01' },
            { name: '搬家', value: '02' },
            { name: '結婚', value: '03' },
            { name: '公務', value: '04' },
            { name: '繳稅', value: '06' },
            { name: '其他', value: '05' },
        ];
        const result = await this.simpleModal.addModal(RadioboxDialogComponent, {
            title: '請選擇申請原因',
            list,
            filter: false,
            value: this.ReasonCode
        }).toPromise();
        if (result) {
            if (result === '05') {
                //選擇其他時，動態驗證開啟
                this.disabledText = true;
                this.ApplyIllustrate.setValidators(Validators.required);
                this.ApplyIllustrate.updateValueAndValidity();
            } else {
                this.ApplyIllustrate.setValue(undefined);
                this.ApplyIllustrate.setValidators(Validators.nullValidator);
                this.ApplyIllustrate.updateValueAndValidity();
                this.disabledText = false;
            }
            this.ReasonCode = result; //原因代碼
            const item = list.find((x) => x.value === result).name;
            this.ApplyReason.setValue(item); //原因名稱
        }
    }

    async openLandRegisterAddress() {
        //不動產地址 step1
        const AddrType1List: { name: string; value: string }[] = [//現居
            { name: this.homeAddr, value: '01' },
        ];
        const AddrType2List: { name: string; value: string }[] = [//戶籍
            { name: this.residentAddr, value: '02' },
        ];

        const result = await this.simpleModal
            .addModal(AddressListDialogComponent, {
                title: '請選擇不動產地址',
                AddrType1List,
                AddrType2List,
                value: this.selectedAddrCode,
            })
            .toPromise();
        if (result) {
            if (result === '03') { // 自行輸入
                this.selectedAddrCode = undefined;
                this.AddressType = 3;
                this.manualinputAddr = true;
                this.AddCompanyAddr.setValue(undefined);
            }
            else {
                this.selectedAddrCode = result.toString();
                this.manualinputAddr = false;
                switch (result) {
                    case '01':
                        this.AddressType = 1;
                        this.AddCompanyAddr.setValue(AddrType1List.find(x => x.value === result).name);
                        break;
                    case '02':
                        this.AddressType = 2;
                        this.AddCompanyAddr.setValue(AddrType2List.find(x => x.value === result).name);
                        break;
                }
            }
        }
    }

    ngOnDestroy(): void {
        this.simpleModal.removeAll();
    }
}
