import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentRecordComponent } from './installment-record.component';

describe('InstallmentRecordComponent', () => {
  let component: InstallmentRecordComponent;
  let fixture: ComponentFixture<InstallmentRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallmentRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallmentRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
