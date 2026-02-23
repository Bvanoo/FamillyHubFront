import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretSanta } from './secret-santa';

describe('SecretSanta', () => {
  let component: SecretSanta;
  let fixture: ComponentFixture<SecretSanta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecretSanta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecretSanta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
