import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { tranSharedModule } from '../shared/tranShared.module';
import { UnauthorizedTxnComponent } from './unauthorized-txn.component';
import { MatStepperModule } from '@angular/material/stepper';

const routes: Routes = [{
    path: 'UnauthorizedTxn',
    component: UnauthorizedTxnComponent,
    canActivate: [AuthGuard],
    data: { Sso: true }
}];

@NgModule({
    declarations: [
        UnauthorizedTxnComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        MatStepperModule,
        tranSharedModule,
        RouterModule.forChild(routes),
    ]
})
export class UnauthorizedTxnModule { }
