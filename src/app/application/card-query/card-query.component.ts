import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { error, maxLength, pattern, required, RxFormBuilder } from '@rxweb/reactive-form-validators';
import { CaptchaComponent } from 'src/app/shared/components/captcha/captcha.component';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';
import { StatusInquiryItem } from 'src/app/shared/services/sinopac/apply.model';
import { ApplyService } from 'src/app/shared/services/sinopac/apply.service';
import { AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-card-query',
    templateUrl: './card-query.component.html',
    styleUrls: ['./card-query.component.scss']
})
export class CardQueryComponent implements AfterViewInit {
    private readonly app = new AppWrapper();
    @ViewChild(CaptchaComponent) captcha: CaptchaComponent;
    selectedIndex = 0;
    form: FormGroup; // 未登入查詢
    form2: FormGroup; // 急需用卡申請
    cardItem: StatusInquiryItem[] = [];
    eyeOpen = false;
    sso = false;
    urgentCardApplyBlock = false;
    uploadButton = false;
    downloadButton = false;
    selectMenu = false;
    private Id: string;
    downloadFileUrl = "";
    reasonOptions: string[] = [
        '近期將出國',
        '代繳保費',
        '一般消費',
        '其他'
    ];

    public constructor(
        private formBuilder: RxFormBuilder,
        private applyService: ApplyService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.form = this.formBuilder.formGroup(new CardQueryModel());
        this.form2 = this.formBuilder.formGroup(new UrgentCardApplyModel());
    }

    async ngOnInit() {
        this.app.initHeaderBack('申辦進度');
        this.sso = this.route.snapshot.data.Sso;
        if (this.sso) {
            this.selectedIndex = 1;
            const response = await this.applyService.StatusInquirySso({ ID: AuthHelper.CustomerId.toUpperCase() });
            // 錯誤 回首頁
            if (response?.ResultCode !== '00') {
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
                    window.history.back(); // 返回原頁
                }
                return;
            }
            // 無資料 回首頁
            if (response?.Result?.Items?.length === 0) {
                let swal = Swal.fire({
                    text: '無相關資料', icon: 'error', confirmButtonText: '確定',
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
                return;
            }
            this.cardItem = await response?.Result?.Items;
            this.urgentCardApplyBlock = response?.Result?.CanApplyUrgentCase;
            await this.determineButtonAppear();
        }
    }

    public ngAfterViewInit() {
        //- 身分證顯示
        $('.form__eye').on('click', (e: any) => {
            this.eyeOpen = !this.eyeOpen;
            if (this.eyeOpen) {
                $("input[name=UserId]").focus();
            }
        })

        // 急需用卡確認Button
        $(':radio[name="reason"]').change(function () {
            var reason = $(this).filter(':checked').val();
            if (reason) {
                $('.btn--check').removeAttr("disabled");
            }
        });
    }

    /**
     * 檢查表單(身分證字號、出生年月日、驗證碼)後打API
     *  成功: 前往 Step2 (信用卡申請進度列表)
     *  失敗: 燈箱顯示錯誤訊息
     */
    async onSubmit() {
        this.form['submitted'] = true;
        if (this.form.valid) {
            await this.StatusInquiry(this.form.value.UserId, this.form.value.DOB, this.form.value.Captcha);
        }
        this.captcha.refreshCaptcha();
    }

    // API (申請進度查詢)
    async StatusInquiry(id: string, dob: string, captcha: string) {
        try {
            const response = await this.applyService.StatusInquiry({ ID: id.toLocaleUpperCase(), BIRTHDAY: dob }, captcha);
            if (ServiceHelper.ifSuccess(response, false)) {
                // 無資料
                if (response?.Result?.Items?.length === 0) {
                    let swal = Swal.fire({
                        text: '無相關資料', icon: 'error', confirmButtonText: '確定',
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
                    return;
                }
                this.cardItem = response?.Result?.Items;
                this.urgentCardApplyBlock = await response?.Result?.CanApplyUrgentCase;
                this.selectedIndex++;
                this.Id = id.toLocaleUpperCase();
                await this.determineButtonAppear();
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
                    window.history.back(); // 返回原頁
                }
                return;
            }
        }
        catch (error) {
            if (error.status === 406) { // 驗證碼錯誤
                this.form.controls.Captcha['setBackEndErrors']({ invalidValue: error.error });
            }
            else {
                console.log(error);
                ServiceHelper.showError('系統發生錯誤，請稍後再試！');
            }
        }
    }

    // 返回「首頁」
    goHome() {
        this.app.exitWebToHome({ needLogin: false, needQuickLogin: false });
    }

    // 急需用卡 phase 2
    async statusWorkflow() {
        try {
            const response = await this.applyService.SendWorkflow({
                ID: this.sso ? AuthHelper.CustomerId.toUpperCase() : this.Id,
                Description: `${this.form2.value.ReasonType}(${this.form2.value.Description})`
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                let swal = Swal.fire({
                    text: '已送出，請靜候佳音', icon: 'success', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                if ((await swal).isConfirmed) {
                    this.urgentCardApplyBlock = false;
                }
                return;
            } else {
                let swal = Swal.fire({
                    text: "發生錯誤請稍後再試!", icon: 'error', confirmButtonText: '確定',
                    showClass: {
                        popup: 'animate__animated animate__fadeIn animate__faster'
                    },
                    hideClass: {
                        popup: 'animate__animated animate__fadeOut animate__faster'
                    }
                });
                if ((await swal).isConfirmed) {
                    window.history.back();
                }
                return;
            }
        }
        catch (error) {
            let swal = Swal.fire({
                text: "發生錯誤請稍後再試!", icon: 'error', confirmButtonText: '確定',
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

    // 上傳缺補文件 phase 2
    upload() {
        if (!this.sso) {
            this.router.navigate(['/Application/CardAddDoc'], {
                state: {
                    Id: this.Id
                }
            });
            return;
        }
        this.router.navigate(['/Application/CardAddDoc/Sso']);
    }

    // 下載聲明書 phase 2
    download() {
        location.href = this.downloadFileUrl + "#open-browser";
    }

    // 聯繫客服
    customerService() {
        this.app.showCustomerService();
    }

    public onImgError(event) {
        event.target.src = 'mma8/card/images/card-lost/default.png';
    }

    async urgentCardApplySubmit() {
        this.form2['submitted'] = true;
        if (this.form2.valid) {
            await this.statusWorkflow();
        }
    }

    confirmReasonType(e) {
        var Reason = $(':radio[name="reason"]').filter(':checked').val();
        $('.select-btn span').addClass('selected').html(Reason);
        this.selectMenu = false;
        this.form2.patchValue({ ReasonType: Reason });
    }

    // 判斷顯示按鈕
    determineButtonAppear(){
        for(let i=0;i<this.cardItem.length;i++){
            if(this.cardItem[i]?.UploadFileMessages?.length > 0 && !this.uploadButton)
                this.uploadButton = true;
            if(this.cardItem[i]?.DownloadFileMessages?.length > 0 && !this.downloadButton)
                this.downloadButton = true;
            if(this.uploadButton && this.downloadButton)
                break;
        }
        this.downloadFileUrl = this.cardItem.findIndex((e)=>e.LetterCode=="B"||e.LetterCode=="D")!=-1 ? "https://bank.sinopac.com/MMA8/DocDownload/CPM-207.pdf":"https://bank.sinopac.com/MMA8/DocDownload/CPM-206.pdf" ;
    }

}

// 申請進度查詢
class CardQueryModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*身分證字號不能空著唷。' })
    @pattern({ expression: { pattern: /^[a-zA-Z]\d{9}$/ }, message: '*哎呀！身分證字號格式有誤，請重新輸入。' })
    UserId: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*出生年月日不能空著唷。' })
    @pattern({ expression: { pattern: /^(0?[1-9]|1[0-2])(0?[1-9]|[12][0-9]|3[01])$/ }, message: '*哎呀！出生年月日格式有誤，請重新輸入。' })
    DOB: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '*驗證碼不能空著唷。' })
    @pattern({ expression: { pattern: /^[\d]{6}$/ }, message: '*哎呀！驗證碼格式有誤，請重新輸入。' })
    Captcha: string;
}

// 急需用卡
class UrgentCardApplyModel {
    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '請選擇' })
    ReasonType: string;

    @error({ conditionalExpression: (control: AbstractControl) => control.parent['submitted'] })
    @required({ message: '說明原因不能空著唷。' })
    @maxLength({ value: 50, message: '字數限制50字以內唷。' })
    Description: string;
}
