import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { SharedModule } from 'src/app/shared/shared.module';
import { RewardPointsManageComponent } from './rewardpoints-manage.component';

const routes: Routes = [{
    path: 'RewardPointsManage',
    component: RewardPointsManageComponent,
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
        RewardPointsManageComponent
    ],
    providers: [
    ]
})
export class RewardPointsManageModule { }
