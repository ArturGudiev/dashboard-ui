import { Component, input, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NestedTreeControl } from "@angular/cdk/tree";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { MaterialModule } from "../../../modules/material/material.module";
import { NgStyle } from "@angular/common";
import { colorPink } from "../../../shared/constants";

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  depth: number;
}


@Component({
  selector: 'app-my-tree',
  imports: [MaterialModule, NgStyle],
  templateUrl: './my-tree.component.html',
  standalone: true,
  styleUrl: './my-tree.component.scss'
})
export class MyTreeComponent implements OnInit, OnChanges {
  treeData = input<TreeNode[]>([]);

  treeControl = new NestedTreeControl<TreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNode>();

  protected readonly colorPink = colorPink;

  ngOnInit(): void {
    this.dataSource.data = this.treeData();
  }

  ngOnChanges(changes:SimpleChanges) {
    if (changes['treeData']) {
      this.dataSource.data = this.treeData();
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

