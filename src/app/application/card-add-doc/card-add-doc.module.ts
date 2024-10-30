import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { CardAddDocComponent } from './card-add-doc.component';
import { MatStepperModule } from '@angular/material/stepper';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'ng2-file-upload';
import { NgxMaskModule } from 'ngx-mask';

const routes: Routes = [{
	path: 'CardAddDoc/Sso',
	component: CardAddDocComponent,
	canActivate: [AuthGuard],
    data: { Sso: true }
},{
	path: 'CardAddDoc',
	component: CardAddDocComponent,
    data: { Sso: false }
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
        MatStepperModule,
        ReactiveFormsModule,
        FileUploadModule,
		RouterModule.forChild(routes),
        NgxMaskModule.forRoot(),
	],
	declarations: [
        CardAddDocComponent
	],
	providers: [
	]
})
export class CardAddDocModule { }
