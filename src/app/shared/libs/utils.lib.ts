import { TaskContainerDescription } from "../../models/interfaces/types";

export function getJSONFileContent() { }

export function replaceInArrayIfFind<T>(arr: T[], predicate: (e: T) => boolean, valueToPutIfFind: T): void {
  const index = arr.findIndex(predicate);
  if (index >= 0) {
    arr[index] = valueToPutIfFind;
  }
}

export const taskContainerDescriptionsAreEqual = (d1: TaskContainerDescription, d2: TaskContainerDescription): boolean => {
  return d1[0] === d2[0] && d1[1] === d2[1]
}
