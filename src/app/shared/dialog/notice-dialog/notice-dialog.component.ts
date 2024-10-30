import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SimpleModalComponent } from 'ngx-simple-modal';
import { GetAgreementInfoRq, GetAgreementInfoRs } from 'src/app/shared/services/sinopac/agreement.models';
import { AgreementService, AuthHelper, ServiceHelper } from 'src/app/shared/shared.module';
import Swal from 'sweetalert2';

export interface NoticeModel extends GetAgreementInfoRq {
    NoticeMatter: string,
    /** Checkbox詳閱文字內容，用'@&&'替代NoticeMatter文字 */
    NoticeContent: string,
    color?: string,
    Title2?: string
}

@Component({
    selector: 'app-notice-dialog',
    templateUrl: './notice-dialog.component.html',
    styleUrls: ['./notice-dialog.component.scss']
})
export class NoticeDialogComponent extends SimpleModalComponent<NoticeModel, boolean> implements OnInit {
    // 條款名稱
    Title: string;
    /** 第二標題，用於條款彈窗標題希望顯示其他名稱而非條款名稱 */
    Title2: string = "";
    // 來源程式名稱 ex.CAWHO
    Source: string;
    // 底下的詳閱文字
    NoticeMatter: string;
    /** Checkbox詳閱文字內容 */
    NoticeContent: string;
    NoticeContent1: string;
    NoticeContent2: string;
    agree: boolean | undefined;
    agreementData: GetAgreementInfoRs | undefined;
    //disable
    disable: boolean = true;
    /**條款dialog顯示 */
    show: boolean = false;
    /**URL color */
    color: string;
    /**條款是否載入完成 */
    termsLoaded: boolean = false;

    constructor(
        private agreementService: AgreementService,
        private cdRef: ChangeDetectorRef
    ) {
        super();
    }

    async ngOnInit(): Promise<void> {
        try {
            const response = await this.agreementService.getAgreementInfo({
                Title: this.Title,
                Source: this.Source
            });
            if (ServiceHelper.ifSuccess(response, false)) {
                this.agreementData = response.Result;
                this.NoticeContent1 = this.NoticeContent.split('@&&')[0];
                this.NoticeContent2 = this.NoticeContent.split('@&&')[1];
                this.show = true;
            } else {
                this.cancel();
                this.getAgreementFailAlert();
            }
        } catch (error) {
            console.log(error);
            this.getAgreementFailAlert();
        }
    }

    checkDisable() {
        if (!this.termsLoaded) {
            const domClientHeight = document.getElementById("terms_outer").clientHeight; // div高度
            const domScrollHeight = document.getElementById("terms_innter").scrollHeight; // dom 包含scroll總高
            const isScrollbarVisible = domScrollHeight > domClientHeight;
            this.disable = isScrollbarVisible;
            this.cdRef.detectChanges();
            this.termsLoaded = true;
        }
    }

    ngAfterViewChecked(): void {
        if (!this.termsLoaded) {
            const termsContent1 = document.querySelector('.termsContent1');
            if (termsContent1 && termsContent1.innerHTML !== '') {
                this.checkDisable();
            }
            const termsContent2 = document.querySelector('.termsContent2');
            if (termsContent2 && termsContent2.innerHTML !== '') {
                console.log(termsContent2);
                this.checkDisable();
            }
        }
    }

    confirm() {
        // 新增同意條款紀錄
        this.agreementService.insertAgreementRecord({
            ID: AuthHelper.CustomerId,
            Title: this.agreementData.Title,
            Version: this.agreementData.Version,
            Source: 'CAWHO'
        });
        this.result = true;
        this.close();
    }

    cancel() {
        this.result = false;
        this.close();
    }

    /**
     *
     * @param state disable的狀態
     */
    changeState(state: boolean) {
        if (!state) {
            this.agree = state;
        }
        this.disable = !state;
    }

    /** 取得條款失敗、錯誤提示 */
    getAgreementFailAlert(): void {
        Swal.fire({
            text: `取得${this.Title}條款失敗，請稍後再試`, icon: 'error', confirmButtonText: '確定',
            showClass: {
                popup: 'animate__animated animate__fadeIn animate__faster'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOut animate__faster'
            },
            allowOutsideClick: false
        });
    }
}

export enum urlColor {
    /**不套用顏色 */
    None = 'unset'
}
