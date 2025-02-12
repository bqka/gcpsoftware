"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

interface SelectionProps {
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

export type SingleWire = {
  id: number;
  sequence: string;
  date: string;
};

type RemoveItemCallback = (id: number) => void;

export const columns = (
  removeItem: RemoveItemCallback,
  selectionActions: SelectionProps // 🟢 Pass selection as a single prop
): ColumnDef<SingleWire>[] => {
  const { selectedId, setSelectedId } = selectionActions; // 🟢 Destructure selection state & setter

  return [
    {
      id: "select",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <input
            type="radio"
            name="selectedRow"
            checked={selectedId === item.id}
            onChange={() => setSelectedId(item.id)}
            className="cursor-pointer"
            onClick={(e) => e.stopPropagation()} // 🟢 Prevent row click from triggering deselection
          />
        );
      },
    },
    {
      accessorKey: "id",
      header: "Id",
    },
    {
      accessorKey: "sequence",
      header: "Sequence",
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
            <a
              className="hover:cursor-pointer"
              onClick={(e) => {
                e.stopPropagation(); // 🟢 Prevent row selection when clicking delete
                removeItem(item.id);
              }}
            >
              <Trash size={16} color="red" />
            </a>
          </div>
        );
      },
    },
  ];
};