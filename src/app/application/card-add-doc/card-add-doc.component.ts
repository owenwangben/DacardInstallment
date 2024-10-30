import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileItem, FileLikeObject, FileUploader, ParsedResponseHeaders } from 'ng2-file-upload';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { MyDataDoRequestModel, MyDataLoginRequestModel, MyDataLoginResponseModel } from 'src/app/shared/services/sinopac/shared.model';
import { ApplyService, AuthHelper, LoaderService, ServiceHelper, SharedService } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';
import { error, pattern, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { AbstractControl, FormGroup } from '@angular/forms';
import { CaptchaComponent } from 'src/app/shared/components/captcha/captcha.component';
import { objectToEncryptString } from 'src/app/shared/services/sinopac/shared.service';

@Component({
    selector: 'app-card-add-doc',
    templateUrl: './card-add-doc.component.html',
    styleUrls: ['./card-add-doc.component.scss']
})
export class CardAddDocComponent implements AfterViewInit {
    selectedIndex = 0;
    idNumber = '';
    private fileIds = new Array(12).fill(undefined);
    private tempFileIds = new Array();
    img_src: Array<string> = new Array(3).fill(undefined);
    img_name: Array<string> = new Array(); // 財力證明圖片名稱
    uploaders = new Array<FileUploader>(3);
    allowedMimeType: string[] = ['image/jpeg', 'image/tiff', 'image/png'];
    uploadCount = 0;
    upload_success = true; // 上傳成功 / 失敗 flag
    error_msg = 'error'; // 上傳失敗代碼
    public mydataForm: MyDataLoginResponseModel;
    // public isMobile = environment.IsMobile;
    app = new AppWrapper();
    sso = false;
    form: FormGroup;
    type: string = "0";
    hideUploadBtn = false;
    hideUploadBlock = false;
    eyeOpen = false;
    captchaError = false;
    @ViewChild(CaptchaComponent) captcha: CaptchaComponent;

    public constructor(
        private loader: LoaderService,
        private router: Router,
        private applyService: ApplyService,
        private route: ActivatedRoute,
        private sharedService: SharedService,
        private formBuilder: RxFormBuilder) {
        this.form = this.formBuilder.formGroup(new CardAddDocModel());
    }

    ngOnInit() {
        this.app.initHeaderBack('線上補件');
        this.sso = this.route.snapshot.data.Sso;
        this.idNumber = history.state.Id ?? "";
        if (this.sso) {
            this.idNumber = AuthHelper.CustomerId;
            // 初始化 uploaders
            for (let i = 0; i < this.uploaders.length; i++) {
                this.newUploaders(i);
            }
            window.scrollTo(0, 0)
        } else if (this.idNumber) {
            this.form.patchValue({ UserId: this.idNumber });
        }

        this.app.dialogCallackEvent.subscribe(event => {
            if (event.id === 'toMyData' && event.action === 0) {
                // TODO: MyData頁面導引
                this.postMydata();
            }
        });
    }

    public ngAfterViewInit() {
        // 選擇圖片
        $('input[type="file"]').on('change', function (e) {
            const _this = $(this);
            const id = _this.attr("id");
            const _val = $(this).val();
            const data = _this.parent().siblings('.form__data');

            if (_this[0].files && _this[0].files[0]) {
                const file = _this[0].files[0];
                if (file.size > 5 * 1024 * 1024) {
                    return;
                }
                if (!(file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/tiff')) {
                    return;
                }

                // 身分證正面 / 身分證反面
                if (id === 'upload-1' || id === 'upload-2') {
                    //- 圖片
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        _this.parent().addClass('hide');
                        data.removeClass('hide');
                        data.find('img').attr('src', e.target.result);
                    }
                    reader.readAsDataURL(_this[0].files[0]);
                    //- 圖片名稱
                    const startIndex = _val.indexOf('\\') >= 0 ? _val.lastIndexOf('\\') : _val.lastIndexOf('/');
                    let filename = _val.substring(startIndex);
                    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                        filename = filename.substring(1);
                    }
                    data.find('.msg').html(filename);
                }
            }

        });

        // 刪除上傳檔案
        $(".icon--fail-black").on("click", function () {
            const data = $(this).parents(".form__data");
            data.addClass("hide");
            data.siblings(".form__upload").removeClass("hide");
            data.find("img").attr("src", "");
            data.find(".msg").html("");
        });

        //- 身分證顯示
        $('.form__eye').on('click', (e: any) => {
            this.eyeOpen = !this.eyeOpen;
            if (this.eyeOpen) {
                $("input[name=UserId]").focus();
            }
        })
    }

    onBeforeUploadItem(index: number, fileItem: FileItem): any {
        this.loader.display(true);
    }

    onWhenAddingFileFailed(index: number, item: FileLikeObject, filter: any, options: any) {
        $('#upload-1').val('');
        $('#upload-2').val('');
        $('#upload-3').val('');
        let error_content = '檔案格式不符!';
        switch (filter.name) {
            case 'fileSize':
                error_content = '檔案不得超過 5MB!';
                break;
            case 'mimeType':
                error_content = '檔案格式不符!';
                break;
            case 'queueLimit':
                error_content = '財力證明文件最多上傳10張!';
                break;
            default:
                break;
        }

        Swal.fire({
            text: error_content, icon: 'error', confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            }
        });
    }

    onSuccessItem(index: number, item: FileItem, response: string, status: number, headers: ParsedResponseHeaders): any {
        this.loader.display(false);
        const json = JSON.parse(response);
        if (json.FileId !== null && json.FileId !== '') {
            if (index != 2) {
                this.fileIds[index] = json.FileId;
            }
            else {
                this.tempFileIds.push(json.FileId);
                // const i = this.uploaders[2].queue.indexOf(item);
                // this.fileIds[i + 2] = json.FileId;
            }
        }
        else {
            this.upload_success = false;
        }
        this.uploadCount++;  // 計算已上傳(UploadFile)的數量
    }

    /**
     * step1：確定上傳
     * step2：確定送出
     */
    onSubmit(step: string) {
        if (step === 'step1') {
            let hasFile = false;
            let errorMessage = '請上傳文件';
            for (let i = 0; i < this.uploaders.length; i++) {
                if (this.uploaders[i].queue.length > 0) {
                    hasFile = true;
                    break;
                }
            }
            if (hasFile) {
                this.selectedIndex++;
                this.compositeFileIdsfArray()
            }
            else {
                Swal.fire({
                    text: errorMessage, icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
            }
            window.scroll(0, 0);
        }
        else if (step === 'step2') {
            this.completeUpload();
        }
    }

    readUrl($event, index: number, uploader: FileUploader) {
        if (index < 2) {
            this.fileIds[index] = undefined;
        }
        this.img_src[index] = "";
        if ($event.target.files && $event.target.files[0]) {
            /*
            const fname: string = $event.target.files[0].name;
            const fext: string = fname.split('.').pop();
            if (fext.toLowerCase().startsWith('tif')) {
                this.img_fname[index] = fname;
            }
            else {
                const reader = new FileReader();
                reader.onload = (evt: any) => this.img_src[index] = evt.target.result;
                reader.readAsDataURL($event.target.files[0]);
            }
            */
            // 身分證正面 / 身分證反面
            if (index === 0 || index === 1) {
                const reader = new FileReader();
                reader.onload = (evt: any) => {
                    if (evt.total > 5 * 1024 * 1024) {
                        return;
                    }
                    const result = evt.target.result;
                    if (!(result.indexOf('data:image/png') >= 0 ||
                        result.indexOf('data:image/jpeg') >= 0 ||
                        result.indexOf('data:image/tiff') >= 0)) {
                        return;
                    }
                    this.img_src[index] = evt.target.result;
                };
                reader.readAsDataURL($event.target.files[0]);
            }
            // 財力或其他證明文件
            else if (index === 2 && uploader.queue.length > this.img_name.length) {
                this.img_name.push($event.target.files[0].name);
                $("#upload-3").val('');
            }
        }
    }

    /**
     * 設定uploaders
     */
    newUploaders(i: number) {
        const queueLimit = i === 2 ? 10 : 1;
        this.uploaders[i] = new FileUploader({
            url: "api/Apply/UploadFile",
            method: "POST",
            autoUpload: true, // 自動上傳
            maxFileSize: 5 * 1024 * 1024,
            allowedMimeType: this.allowedMimeType,
            queueLimit: queueLimit,
            itemAlias: "File",
            additionalParameter: {
                ID: this.idNumber,
                Type: i < 2 ? i + 1 : this.type
                // FileIndex: i,
                // ApplicationName: ServiceHelper.ApplicationName
            }
        });
        this.uploaders[i].onBeforeUploadItem = this.onBeforeUploadItem.bind(this, i);
        this.uploaders[i].onWhenAddingFileFailed = this.onWhenAddingFileFailed.bind(this, i);
        this.uploaders[i].onSuccessItem = this.onSuccessItem.bind(this, i);
        this.uploaders[i].onAfterAddingFile = this.onAfterAddingFile.bind(this, i)
    }

    // 移除上傳圖片
    remove(index: number, img_i?: number) {
        $('#upload-1').val('');
        $('#upload-2').val('');
        $('#upload-3').val('');
        if (index === 0 || index === 1) {
            this.img_src[index] = "";
            this.newUploaders(index);
            this.fileIds[index] = undefined;
        }
        else if (index === 2) {
            this.img_name.splice(img_i, 1);
            this.uploaders[2].queue.splice(img_i, 1);
            this.tempFileIds.splice(img_i, 1);
            // this.fileIds[img_i + 2] = undefined;
            this.uploadLimit();
        }
    }


    // 外開連結
    toExternalLink(link: string) {
        location.href = link;
    }

    // 返回「卡片管理頁面」or「首頁」
    goToCardManage() {
        if(this.sso){
            this.router.navigateByUrl('/Account/CardManage');
        }else{
            this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
        }
    }

    // 前往MyData
    async toMyData() {
        const text = '<div style="text-align:left;"><p style="color:#545454;">您已充分閱讀並同意永豐銀行個人資料蒐集、處理及利用告知義務內容，接下來您即將離開永豐銀行網頁，前往個人化資料自主運用(MyData)平臺。</p>' +
            '<p style="color:#545454;">為簡化線上申辦信用卡補件服務流程，透過個人化資料自主運用(MyData)平臺服務，經消費者完成身分驗證及同意後，將戶政國民身分證影像、勞保被保險人投保、財稅個人財產及所得資料等提供予本行做為申辦信用卡之相關證明文件。 若您在申辦過程中有任何疑問，請洽客服專線(02)2528-7776/0800-058-888(限市話)</p>' +
            '<p style="color:red">※提醒您，使用前請備妥自然人憑證與讀卡機，並安裝驅動程式，更多資訊請至個人化資料自主運用(MyData)平臺。</p>' +
            '<p style="color:red">※個人化資料自主運用(MyData)平臺適用 Chrome 80、Safari 13、Firefox 75、Edge18 以上之版本，1280 x 1024 解析度瀏覽，不適用IE瀏覽器。手機適用 iOS 12.4、Android 8.0 以上之系統。</p>' +
            '<p style="color:red">※個人化資料自主運用(MyData)平臺服務固定於每週三17：00～19：00進行系統維護作業，屆時暫無法進行資料授權取用，造成不便，敬請見諒。</p></div>';
        this.app.showHtmlDialog({ id: 'toMyData', title: '前往個人化資料自主運用(MyData)平臺', htmlstr: text, btnOK: '同意並前往' });
    }

    // 聯繫客服
    CallCustomerServer() {
        this.app.showCustomerService();
    }

    // 完成上傳檔案API (/api/Apply/CompleteUploadFile or /api/Apply/CompleteUploadFile2)
    async completeUpload() {
        // 上傳圖片時沒有錯誤才complete upload
        this.loader.display(true);
        var response
        if (this.upload_success) {
            //已登入使用CompleteUpload2可接收推播
            if (this.sso) {
                response = await this.applyService.CompleteUpload2({ ID: this.idNumber, FileIds: this.fileIds.filter(item => !!item) });
            }
            else{
                response = await this.applyService.CompleteUpload({ ID: this.idNumber, FileIds: this.fileIds.filter(item => !!item) });
            }

            if (response.ResultCode === '00') {
                this.upload_success = true;
                this.selectedIndex++;
            }
            else {
                this.upload_success = false;
                this.error_msg = response.ResultCode;
                this.selectedIndex++;
            }
        }
        else {
            this.selectedIndex++;
        }
        this.loader.display(false);

    }

    // 上傳失敗，再試一次 (重設)
    reset() {
        $('#upload-1').val('');
        $('#upload-2').val('');
        $('#upload-3').val('');
        this.selectedIndex = this.sso ? 0 : 1;
        this.fileIds = new Array(12).fill(undefined);
        this.img_src = new Array(3).fill(undefined);
        this.img_name = new Array(); // 財力證明圖片名稱
        this.uploaders = new Array<FileUploader>(3);

        // 初始化 uploaders
        for (let i = 0; i < this.uploaders.length; i++) {
            this.newUploaders(i);
        }
        this.uploadCount = 0;
        this.upload_success = true;
        this.error_msg = '';

        for (let i = 1; i <= 2; i++) {
            let form__data = $('#form__data' + i.toString());
            form__data.addClass("hide");
            form__data.siblings(".form__upload").removeClass("hide");
            form__data.find("img").attr("src", "");
            form__data.find(".msg").html("");
        }
    }

    async getToken() {
        const model = {
            ID: this.idNumber,
            FunctionCode: 2,
            IsMobile: true
        } as MyDataLoginRequestModel;
        const response = await this.sharedService.mydataLogin(model);
        if (ServiceHelper.ifSuccess(response)) {
            this.mydataForm = response.Result;
            this.toMyData();
            return true;
        }
        return false;
    }

    async postMydata() {
        const model = {
            VerifyNo: this.mydataForm.VerifyNo
        } as MyDataDoRequestModel;
        await this.sharedService.mydataDo(model);
        this.app.initHeaderBack('線上補件');

        let loginData = objectToEncryptString(this.mydataForm);
        location.href = `${window['site_config'].site_url}Application/MyDataRelay?do=${loginData}#open-browser`;
        // $("#mydata-form").attr("action", this.mydataForm.TwidPortalUrl + '/DO').submit();
    }

    async formValidate() {
        this.form['submitted'] = true;
        if (this.form.valid) {
            await this.checkId(this.form.value.UserId, this.form.value.Captcha);
        }
        this.captcha.refreshCaptcha();
    }

    // API api/Apply/UploadFileCheckID 身分證格式檢驗
    async checkId(id: string, captcha: string) {
        try {
            const response = await this.applyService.CheckId(id.toLocaleUpperCase(), captcha);
            if (ServiceHelper.ifSuccess(response, false)) {
                this.idNumber = id.toLocaleUpperCase();
                this.selectedIndex++;
                for (let i = 0; i < this.uploaders.length; i++) {
                    this.newUploaders(i)
                }
            }
            else {
                Swal.fire({
                    text: response?.ResultMessage, icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                this.captchaError = true;
                return;
            }
        }
        catch (error) {
            if (error.status === 406) { // 驗證碼錯誤
                this.form.controls.Captcha['setBackEndErrors']({ invalidValue: error.error });
                this.captchaError = true;
            }
            else {
                console.log(error);
                let swal = Swal.fire({
                    text: '系統發生錯誤，請稍後再試！', icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                      },
                      hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                if ((await swal).isConfirmed) {
                    window.history.back(); // 返回原頁
                }
            }
        }
    }

    // 財力證明檔案類型選項
    changeFinancialStatementType($event) {
        this.type = $event.target.value;
        this.hideUploadBtn = true;
        this.hideUploadBlock = true;
        this.uploaders[2].setOptions({
            additionalParameter: {
                ID: this.idNumber,
                Type: this.type
            }
        })
    }

    compositeFileIdsfArray() {
        for (let i = 0; i < this.tempFileIds.length; i++) {
            this.fileIds[i + 2] = this.tempFileIds[i];
        }
    }

    onAfterAddingFile(fileItem: FileItem) {
        this.uploadLimit();
    }

    uploadLimit() {
        if (this.uploaders[2].queue.length == 10)
            this.hideUploadBtn = false;
        else
            this.hideUploadBtn = true;
    }

    changeCaptcha(){
        if(this.captchaError){
            this.form.controls['Captcha'].setValue("");
            this.captchaError = false;
        }
    }

}

class CardAddDocModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*身分證字號不能空著唷。' })
    @pattern({ expression: { pattern: /^[a-zA-Z]\d{9}$/ }, message: '*哎呀！身分證字號格式有誤，請重新輸入。' })
    UserId: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*驗證碼不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{6}$/ }, message: '*哎呀！驗證碼格式有誤，請重新輸入。' })
    Captcha: string;
}
