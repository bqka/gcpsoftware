"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";

interface SelectionProps {
  selectedWireId: number | null;
  setSelectedWireId: (id: number | null) => void;
}

export type SingleWire = {
  id: number;
  sequence: string;
  created_at: string;
};

type RemoveItemCallback = (id: number) => void;

export const columns = (
  removeItem: RemoveItemCallback,
  selectionActions: SelectionProps
): ColumnDef<SingleWire>[] => {
  const { selectedWireId, setSelectedWireId } = selectionActions;

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
            checked={selectedWireId === item.id}
            onChange={() => setSelectedWireId(item.id)}
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
      accessorKey: "created_at",
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