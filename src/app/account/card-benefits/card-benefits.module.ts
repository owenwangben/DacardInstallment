import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { CardBenefitsComponent } from './card-benefits.component';

const routes: Routes = [
    {
        path: 'CardBenefits',
        component: CardBenefitsComponent,
    },
];

@NgModule({
    imports: [
        SharedModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
    ],
    declarations: [CardBenefitsComponent],
    providers: [],
})
export class CardBenefitsModule {}
