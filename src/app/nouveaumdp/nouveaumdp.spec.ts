import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Nouveaumdp } from './nouveaumdp';

describe('Nouveaumdp', () => {
  let component: Nouveaumdp;
  let fixture: ComponentFixture<Nouveaumdp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nouveaumdp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Nouveaumdp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
