import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { RewardPointsRecordComponent } from './rewardpoints-record.component';

const routes: Routes = [{
	path: 'RewardPointsRecord',
	component: RewardPointsRecordComponent,
    canActivate: [AuthGuard],
}];

@NgModule({
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
	],
	declarations: [
		RewardPointsRecordComponent
	],
	providers: [
	]
})
export class RewardPointsRecordModule { }
