import { RouterModule } from '@angular/router';
import { NgModule } from "@angular/core";
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	imports: [
        CommonModule,
        // FormsModule,
        ReactiveFormsModule,
        RouterModule
	],
    declarations: [
        HomeComponent
	]
})
export class HomeModule { }
export { HomeComponent }
