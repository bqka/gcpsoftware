"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Item = {
  id: number;
  date: string;
  name: string;
  imagePath: string;
};

export const columns: ColumnDef<Item>[] = [
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
          <a className="hover:cursor-pointer">
            <Trash size={16} />
          </a>
        </div>
      );
    },
  },
];
