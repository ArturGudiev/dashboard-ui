import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Question} from "../../../models/question";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";
import {QuestionsService} from "../../../services/questions.service";

@Component({
  selector: 'app-subquestions',
  templateUrl: './subquestions.component.html',
  styleUrls: ['./subquestions.component.sass']
})
export class SubquestionsComponent implements OnInit {
  @Input() questions: Question[] = [];
  @Output() addQuestion = new EventEmitter();
  @Output() refreshQuestions = new EventEmitter();
  @Output() answerTheQuestion = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];
  selection = new SelectionModel<Question>(true, []);

  constructor(private questionsService: QuestionsService,
              private router: Router) { }

  ngOnInit(): void {
  }

  onAnswerQuestionClick() {
    this.questionsService.finishQuestion(this.selection.selected[0]).subscribe(
      {
        next: () => {
          this.selection.clear();
          this.refreshQuestions.emit();
        }
      }
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.questions.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.questions);
  }

  onQuestionClick(question: Question) {
    this.router.navigate(['question', question._id]).then();
  }

}
