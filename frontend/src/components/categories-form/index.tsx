import {
  Tree,
  TreeViewElement,
  CollapseButton,
} from "@/components/ui/extension/tree-view-api";
import { TreeItem, TreeView } from "@/components/ui/extension/tree-view";

const expenseElements: TreeViewElement[] = [
  {
    id: "1",
    name: "Dining Out",
    children: [
      {
        id: "2",
        name: "Lunch",
      },
      {
        id: "3",
        name: "Breakfast",
      },
      {
        id: "5",
        name: "Dinner",
      },
    ],
  },
  {
    id: "6",
    name: "Entertainment",
    children: [
      {
        id: "7",
        name: "Cinema",
      },
      {
        id: "8",
        name: "Arcade",
      },
    ],
  },
];

const incomeElements: TreeViewElement[] = [
  {
    id: "10",
    name: "Employer",
  },
  {
    id: "11",
    name: "Stocks",
  },
];

export default function CategoriesForm() {
  return (
    <div className="grid grid-flow-col gap-5 h-[350px] w-full">
      <div className="grid grid-flow-row">
        <p>Expenses</p>
        <TreeView
          className=" bg-background p-6 rounded-md"
          indicator={true}
          elements={expenseElements}
          expandAll
          hideExpandAllButton
        />
      </div>
      <div className="grid grid-flow-row">
        <p>Incomes</p>
        <TreeView
          className="bg-background p-6 rounded-md"
          indicator={true}
          elements={incomeElements}
          hideExpandAllButton
          expandAll
        />
      </div>
    </div>
  );
}
