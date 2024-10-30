import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { FidoVerifyRecordDetailComponent } from './detail.component';

const routes: Routes = [{
	path: 'FidoVerifyRecord-Detail',
	component: FidoVerifyRecordDetailComponent,
	canActivate: [AuthGuard],
    data: { Sso: true }
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot()
	],
	declarations: [
        FidoVerifyRecordDetailComponent
	],
	providers: [
	]
})
export class FidoVerifyRecordDetailModule { }
