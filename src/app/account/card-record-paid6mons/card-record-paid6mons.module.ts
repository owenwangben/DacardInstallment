import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { CardRecordPaid6monsComponent } from './card-record-paid6mons.component';

const routes: Routes = [{
	path: 'CaedRecordPaid6mons',
	component: CardRecordPaid6monsComponent,
	canActivate: [AuthGuard]
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
		CardRecordPaid6monsComponent
	],
	providers: [
	]
})
export class CardRecordPaid6monsModule { }
