type Wire = {
  id: number;
  wire_type: string;
  wire_name: string;
  image_front: string;
  image_back: string | null;
  sequence: string;
  created_at: string;
}

type ComparisonResult = {
  match: boolean;
  details: string;
};

type RGB = [number, number, number];

type SingleWireSequence = {
  type: "singlewire";
  sequence: RGB[];
};

type DoubleWireSequence = {
  type: "doublewire";
  sequence_front: RGB[];
  sequence_back: RGB[];
};

type WireSequenceResult = SingleWireSequence | DoubleWireSequence;

type ResultRow = {
  id: number;
  wire_type: string;
  wire_id: number;
  wire_name: string;
  result: boolean;
  details: string;
  compared_at: string;
  tested_by: string;
}

type MismatchRow = {
  id: number;
  wire_name: string;
  sequence: string;
  image_front: string;
  image_back: string | null;
  date: string;
}

interface Window {
    electron: {
        fetchData<T>(tableName: string, wireType: string): Promise<T[]>;
        fetchRow<T>(tableName: string, id: number): Promise<T>;
        fetchImages: (tableName: string, wireType: string, selectedId: number) => Promise<string[] | null>;

        addWire: (wireType: string, wireName: string, sequence: string, base64Images: string[]) => Promise<void>;
        addResult: (wireType: string, wireId: number, wireName: string, result: boolean, details: string, tested_by: string, base64Images: string[]) => Promise<void>;
        addMismatch: (wireType: string, wireName: string, sequence: string, base64Images: string[]) => Promise<void>;
        
        removeItem: (table: string, id: number) => Promise<void>;

        compareItem: (wireCount: number[], originaSequence: string, imageToBeChecked: string[], wireType: string) => Promise<ComparisonResult>;
        getSequence: (wireImages: string[], wireType: string) => Promise<WireSequenceResult>;
    }
}