import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { InstallmentComponent } from './installment.component';
import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [
    {
        path: 'RTEStmt/Sso',
        component: InstallmentComponent,
        canActivate: [AuthGuard],
        data: { Sso: true }
    },
    {
        path: 'RTEStmt',
        component: InstallmentComponent,
        data: { Sso: false }
    }
];

@NgModule({
	imports: [
        CommonModule,
        MatStepperModule,
		SharedModule,
        // ReactiveFormsModule,
        NgxMaskModule.forRoot(),
		RouterModule.forChild(routes)
	],
	declarations: [
        InstallmentComponent,
	],
	providers: [
	]
})
export class InstallmentModule { }
