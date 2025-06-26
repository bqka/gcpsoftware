"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

interface SelectionProps {
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
}

type RemoveItemCallback = (id: number) => void;

export const columns = (
  removeItem: RemoveItemCallback,
  selectionActions: SelectionProps
): ColumnDef<MismatchRow>[] => {
  const { selectedId, setSelectedId } = selectionActions;

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
            onClick={(e) => e.stopPropagation()}
          />
        );
      },
    },
    {
      accessorKey: "wire_name",
      header: "Name",
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
                e.stopPropagation();
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