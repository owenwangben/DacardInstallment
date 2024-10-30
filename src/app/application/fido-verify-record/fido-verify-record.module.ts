import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { NgxMaskModule } from 'ngx-mask';
import { FidoVerifyRecordComponent } from './fido-verify-record.component';
import { FidoVerifyRecordDetailModule } from './detail/detail.module';

const routes: Routes = [{
	path: 'FidoVerifyRecord',
	component: FidoVerifyRecordComponent,
	canActivate: [AuthGuard],
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
        FidoVerifyRecordDetailModule
	],
	declarations: [
        FidoVerifyRecordComponent
	],
	providers: [
	]
})
export class FidoVerifyRecordModule { }
