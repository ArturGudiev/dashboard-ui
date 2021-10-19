import {Component, OnInit, ViewChild} from '@angular/core';
import {CdkDragDrop, CdkDragExit, CdkDropList} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.sass']
})
export class MainPageComponent implements OnInit {
  @ViewChild('aaa') aaa: CdkDropList;
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX – The Rise of Skywalker'
  ];

  title = 'for-test';

  list: any[] = [
    {
      id: 1,
      title: 'Realizar la tarea asignada!',
      subTitle: '9:00pm'
    },
    {
      id: 2,
      title: 'Visitar al perro en casa de tu amiga',
      subTitle: '9:00pm'
    },
    {
      id: 3,
      title: 'Llamar al doctor',
      subTitle: '9:00pm'
    },
    {
      id: 4,
      title: 'Buscar el auto en el taller',
      subTitle: '9:00pm'
    }
  ];

  action = (a: any) => {
    console.log(a);
  };


  drop(event: CdkDragDrop<string[]>) {
    // moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
    // this.aaa.removeItem(event.item);
    this.movies.splice(event.previousIndex, 1);

  }

  drop2(event
          :
          CdkDragExit<string[]>
  ) {
    // moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
    this.aaa.removeItem(event.item);
  }

  constructor() {
  }

  ngOnInit()
    :
    void {
  }

  click(item: {subTitle: string; id: number; title: string} | {subTitle: string; id: number; title: string} | {subTitle: string; id: number; title: string} | {subTitle: string; id: number; title: string}) {

  }
}
