import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { MaterialModule } from "../../../modules/material/material.module";
import { JsonPipe, NgStyle } from "@angular/common";
import { colorPink } from "../../../shared/constants";

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  depth: number;
}

// const TREE_DATA2: TreeNode[] = [
//   {
//     name: 'Parent 1',
//     children: [
//       { name: 'Child 1.1' },
//       {
//         name: 'Child 1.2',
//         children: [
//           { name: 'Grandchild 1.2.1' },
//           { name: 'Grandchild 1.2.2' }
//         ]
//       }
//     ]
//   },
//   {
//     name: 'Parent 2',
//     children: [
//       { name: 'Child 2.1' },
//       { name: 'Child 2.2' }
//     ]
//   }
// ];


@Component({
  selector: 'app-my-tree',
  standalone: true,
  imports: [
    MaterialModule,
    JsonPipe,
    NgStyle
  ],
  templateUrl: './my-tree.component.html',
  styleUrl: './my-tree.component.scss'
})
export class MyTreeComponent implements OnInit, OnChanges {
  @Input() treeData: TreeNode[] = [];

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  protected readonly colorPink = colorPink;

  constructor() { }

  ngOnInit(): void {
    this.dataSource.data = this.treeData;
  }

  ngOnChanges(changes:SimpleChanges) {
    if (changes['treeData']) {
      this.dataSource.data = this.treeData;
      console.log(this.treeData);
    }
  }

  hasChild = (_: number, node: TreeNode) => !!node.children && node.children.length > 0;

  /**
   * Метод возращает правую часть для составной вершины
   */
  numberOfLeafsInNode(node: TreeNode): number {
    if (!node.children || node.children.length === 0) {
        return 1;
    }
    return node.children
      .map(el => this.numberOfLeafsInNode(el))
      .reduce((x, y) => x + y, 0)
  }
}

