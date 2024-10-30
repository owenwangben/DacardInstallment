import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard, CommonModule, SharedModule } from 'src/app/shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { RegisterComponent } from './register.component';

const routes: Routes = [{
	path: 'Register',
	component: RegisterComponent,
}];

@NgModule({
	imports: [
		SharedModule,
        CommonModule,
		RouterModule.forChild(routes),
        MatStepperModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
	],
	declarations: [
		RegisterComponent
	],
	providers: [
	]
})
export class RegisterModule { }
