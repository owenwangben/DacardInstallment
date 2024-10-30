import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CardEnableComponent } from './card-enable.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
    path: 'CardEnable/Sso',
    component: CardEnableComponent,
    canActivate: [AuthGuard],
    data: { Sso: true }
}, {
    path: 'CardEnable',
    component: CardEnableComponent,
    data: { Sso: false }
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
        CardEnableComponent
    ],
    providers: [
    ]
})
export class CardEnableModule { }
