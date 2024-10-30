import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { Routes, RouterModule } from '@angular/router';
import { NgxMaskModule } from 'ngx-mask';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { TempCliComponent } from './temp-cli.component';
import { TempCliStatusModule } from '../temp-cli-status/temp-cli-status.module';


const routes: Routes = [{
    path: 'TempCLI',
    component: TempCliComponent,
    canActivate: [AuthGuard],
    data: { Sso: false }
}];

@NgModule({
    declarations: [
        TempCliComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        MatStepperModule,
        TempCliStatusModule,
        NgxMaskModule.forRoot(),
        RouterModule.forChild(routes),
    ]
})
export class TempCliModule { }
