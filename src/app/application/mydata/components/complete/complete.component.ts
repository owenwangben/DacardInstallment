import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppWrapper } from 'src/app/shared/helpers/app.wrapper';

@Component({
    selector: 'app-complete',
    templateUrl: './complete.component.html',
    styleUrls: ['./complete.component.scss']
})
export class CompleteComponent implements OnInit {
    private readonly app = new AppWrapper();
    success: boolean = false;
    type: number;
    name: string = '';

    constructor(private route: ActivatedRoute) {
        this.route.params.subscribe(params => this.type = +params.type);
        this.route.queryParams.subscribe(params => this.success = params.rc === '0');
    }

    ngOnInit(): void {
        switch (this.type) {
            case 1:
                this.name = "線上辦卡";
                break;
            case 2:
                this.name = "上傳缺補文件";
                break;
            case 3:
                this.name = "永久額度調整";
                break;
            default:
                break;
        }
    }

    /**導到 信用卡帳務-未出帳 */
    goCardManage() {
        this.app.routeByBillID({ billID: '3fbc9a94-7c5d-4915-a83e-fd06544b2a78', closeWeb: true });
    }

    // 聯絡客服
    public callCustomerServer() {
        this.app.showCustomerService();
    }
}
