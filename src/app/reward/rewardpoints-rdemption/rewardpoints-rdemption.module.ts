import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ResultComponent } from './result/result.component';
import { CartComponent } from './cart/cart.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';

const routes: Routes = [{
    path: 'RewardPointsRdemption',
    children: [
        { path: '', redirectTo: 'Cart', pathMatch: 'full' },
        { path: 'Cart', component: CartComponent },
        { path: 'Confirmation', component: ConfirmationComponent },
        { path: 'Result', component: ResultComponent },
    ],
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
        CartComponent,
        ConfirmationComponent,
        ResultComponent
    ],
    providers: [
    ]
})
export class RewardPointsRdemptionModule { }
