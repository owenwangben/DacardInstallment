import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MyDataDoRequestModel, MyDataLoginResponseModel } from 'src/app/shared/services/sinopac/shared.model';
import { SharedService, encryptStringToObject } from 'src/app/shared/services/sinopac/shared.service';

@Component({
    selector: 'app-relay',
    templateUrl: './relay.component.html',
    styleUrls: ['./relay.component.scss']
})
export class RelayComponent implements OnInit {
    mydataForm : MyDataLoginResponseModel;

    constructor(private route: ActivatedRoute, private sharedService: SharedService) {

	}
    async ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.mydataForm = params.do ? encryptStringToObject<MyDataLoginResponseModel>(params.do) : this.mydataForm;
        })

        const model = {
			VerifyNo: this.mydataForm?.VerifyNo
		} as MyDataDoRequestModel;
		await this.sharedService.mydataDo(model);

        if (this.mydataForm?.TwidPortalUrl) {
            $("#mydata-form").attr("action", this.mydataForm?.TwidPortalUrl + '/DO').submit();
        }
    }
}
