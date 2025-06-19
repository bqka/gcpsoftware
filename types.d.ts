type SingleWire = {
  id: number;
  sequence: string;
  created_at: string;
}

type ComparisonResult = {
  match: boolean;
  details: string;
};

type getSequenceResult = {
  sequence: string;
}

type ResultRow = {
  id: number;
  wire_type: string;
  wire_id: number;
  result: boolean;
  details: string;
  compared_at: string;
  tested_by: string;
}

interface Window {
    electron: {
        fetchWireData: (tableName: string) => Promise<SingleWire[]>;
        removeItem: (table: string, id: number) => Promise<void>;
        addItem: (tableName: string, validSequence: string, base64Image: string[]) => Promise<void>;
        compareItem: (originalImage: string[], imageToBeChecked: string[], wireType: string) => Promise<ComparisonResult>;
        fetchWireImage: (selectedWireId: number, wireType: string) => Promise<string[] | null>;
        getSequence: (wireImages: string[], wireType: string) => Promise<getSequenceResult>;
        addResult: (wireType: string, wireId: number, result: boolean, details: string, tested_by: string, base64Images: string[]) => Promise<void>;
        fetchResults: (wireType: string) => Promise<ResultRow[]>;
        fetchResultDetails: (resultId: number) => Promise<string>;
        fetchResultWireImage: (resultId: number) => Promise<string[]>;
    }
}