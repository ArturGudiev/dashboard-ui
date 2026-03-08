import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTreeComponent } from './my-tree.component';

describe('TreeComponent', () => {
  let component: MyTreeComponent;
  let fixture: ComponentFixture<MyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
