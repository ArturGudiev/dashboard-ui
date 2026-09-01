import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type Definition } from '../models/definition';
import { DefinitionsService } from '../services/task-container-services/definitions.service';

export const definitionResolver: ResolveFn<Definition> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(DefinitionsService).getDefinition(id);
};
