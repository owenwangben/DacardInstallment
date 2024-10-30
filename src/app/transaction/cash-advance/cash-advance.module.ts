import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CashAdvanceComponent } from './cash-advance.component';
import { CashAdvanceNoticeComponent } from './cash-advance-notice/cash-advance-notice.component';

const routes: Routes = [{
    path: 'CashAdvance',
    component: CashAdvanceComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        CashAdvanceComponent,
        CashAdvanceNoticeComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MatStepperModule,
        NgxMaskModule.forRoot(),
        RouterModule.forChild(routes),
    ]
})
export class CashAdvanceModule { }
