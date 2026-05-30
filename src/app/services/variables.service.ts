import { Injectable } from '@angular/core';
import { type ContainerVariable } from '../models/task-class';

@Injectable({
  providedIn: 'root',
})
export class VariablesService {
  interpolateString(text: string, variables: ContainerVariable[]): string {
    return text.replace(/\$([a-zA-Z0-9_]+)/g, (match, name: string) => {
      const variable = variables.find((item) => item.variableName === name);
      return variable != null ? variable.variableValue : match;
    });
  }
}
