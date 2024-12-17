import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetrasComponent } from './letras.component';

describe('LetrasComponent', () => {
  let component: LetrasComponent;
  let fixture: ComponentFixture<LetrasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LetrasComponent]
    });
    fixture = TestBed.createComponent(LetrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
