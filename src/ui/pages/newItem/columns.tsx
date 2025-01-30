"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

export type Item = {
  id: number;
  date: string;
  name: string;
  imagePath: string;
};

type DeleteItemCallback = (id: number) => void;

export const columns = (deleteItem: DeleteItemCallback): ColumnDef<Item>[] => [
  {
    accessorKey: "id",
    header: "S. No",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    id: "delete",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="relative">
          <a className="hover:cursor-pointer" onClick={() => deleteItem(item.id)}>
            <Trash size={16} color="red" />
          </a>
        </div>
      );
    },
  },
];
