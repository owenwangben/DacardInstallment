import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { CardInfoComponent } from './card-info.component';

const routes: Routes = [{
    path: 'CardInfo',
    component: CardInfoComponent,
    canActivate: [AuthGuard],
    data: { Sso: true }
}];

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        MatStepperModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
    ],
    declarations: [
        CardInfoComponent
    ],
    providers: [
    ]
})
export class CardInfoModule { }
