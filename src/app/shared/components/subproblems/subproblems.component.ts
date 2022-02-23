import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Problem} from "../../../models/problem";
import {SelectionModel} from "@angular/cdk/collections";
import {ProblemsService} from "../../../services/problems.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subproblems',
  templateUrl: './subproblems.component.html',
  styleUrls: ['./subproblems.component.sass']
})
export class SubproblemsComponent implements OnInit {
  @Input() problems: Problem[] = [];
  @Output() addProblem = new EventEmitter();
  @Output() refreshProblems = new EventEmitter();
  @Output() onProblemSolvedClick = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];

  selection = new SelectionModel<Problem>(true, []);

  constructor(private problemsService: ProblemsService,
              private router: Router) { }

  ngOnInit(): void { }

  onFinishProblemClick() {
    this.problemsService.finishProblem(this.selection.selected[0]).subscribe(
      {
        next: () => {
          this.selection.clear();
          this.refreshProblems.emit();
        }
      }
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.problems.length;
    return numSelected === numRows;
  }


  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.problems);
  }

  onProblemClick(problem: Problem) {
    this.router.navigate(['problem', problem._id]).then();
  }

}
