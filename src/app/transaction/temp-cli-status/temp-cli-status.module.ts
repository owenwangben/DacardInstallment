import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TempCliStatusComponent } from './temp-cli-status.component';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { tranSharedModule } from '../shared/tranShared.module';

const routes: Routes = [{
    path: 'TempCLIStatus',
    component: TempCliStatusComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        TempCliStatusComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        tranSharedModule,
        RouterModule.forChild(routes),
    ]
})
export class TempCliStatusModule { }
