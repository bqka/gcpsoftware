"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

interface SelectionProps {
  selectedResultId: number | null;
  setSelectedResultId: (id: number | null) => void;
}

type RemoveItemCallback = (id: number) => void;

export const columns = (
  removeItem: RemoveItemCallback,
  selectionActions: SelectionProps
): ColumnDef<ResultRow>[] => {
  const { selectedResultId, setSelectedResultId } = selectionActions;

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
            checked={selectedResultId === item.id}
            onChange={() => setSelectedResultId(item.id)}
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
      accessorKey: "wire_id",
      header: "Wire Id",
    },
    {
      accessorKey: "result",
      header: "Result",
    },
    {
      accessorKey: "tested_by",
      header: "Tested By",
    },
    {
      accessorKey: "compared_at",
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