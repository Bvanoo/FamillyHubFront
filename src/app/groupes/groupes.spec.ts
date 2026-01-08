import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Groupes } from './groupes';

describe('Groupes', () => {
  let component: Groupes;
  let fixture: ComponentFixture<Groupes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Groupes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Groupes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
