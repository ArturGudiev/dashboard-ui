import {Component, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {QuestionsService} from "../../../services/questions.service";
import {Question} from "../../../models/question";

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.sass']
})
export class QuestionsComponent implements OnInit, OnChanges {
  questions: Question[];

  constructor(private questionsService: QuestionsService) { }

  ngOnInit(): void {
    this.questionsService.getQuestions().subscribe(questions => {
      this.questions = questions;
    });
  }

  ngOnChanges(changes: SimpleChanges) {

  }

}
