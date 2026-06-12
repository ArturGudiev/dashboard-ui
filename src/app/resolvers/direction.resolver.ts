import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type Direction } from '../models/direction';
import { DirectionsService } from '../services/task-container-services/directions.service';

export const directionResolver: ResolveFn<Direction> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(DirectionsService).getDirection(id);
};
