// var fs = require('file-system');

export function getJSONFileContent(path: string): any {
  // const content = readFileSync(path);
  // return JSON.parse(content.toString());
}


export function replaceInArrayIfFind<T>(arr: T[], predicate: (e: T) => boolean, valueToPutIfFind: T): void {
  const index = arr.findIndex(predicate);
  if (index >= 0) {
    arr[index] = valueToPutIfFind;
  }
}
