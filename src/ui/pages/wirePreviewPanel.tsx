// WirePreviewPanel.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Loader2, Plus, TestTube, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  selectedWireId: number | null;
  selectedWireImages: string[];
  isDoubleWire: boolean;
  isLoadingImage: boolean;
  onAddClick: () => void;
  onTestClick: () => void;
}

export default function WirePreviewPanel({
  selectedWireId,
  selectedWireImages,
  isDoubleWire,
  isLoadingImage,
  onAddClick,
  onTestClick,
}: Props) {
  const navigate = useNavigate();

  const getImageLabel = (index: number) => {
    if (isDoubleWire) return index === 0 ? "Front View" : "Back View";
    return "Single View";
  };

  return (
    <div className="space-y-6 min-w-[500px]">
      {/* Reference Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Reference Images
            {isLoadingImage && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedWireImages.length > 0 ? (
            <div className="space-y-4">
              {selectedWireImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {getImageLabel(index)}
                  </Badge>
                  <div className="aspect-video w-full border rounded-lg overflow-hidden">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${getImageLabel(index)} of ${selectedWireId}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedWireId ? (
            <div className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                {isLoadingImage ? (
                  <>
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p className="text-sm">Loading image...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No image available</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Select an item to view image</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onAddClick}
            className="w-full flex items-center gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Add New {isDoubleWire ? "Double" : "Single"} Wire
          </Button>

          <Button
            onClick={onTestClick}
            disabled={!selectedWireId}
            className="w-full flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Test Selected Item
          </Button>

          <Button
            onClick={() => navigate("/results")}
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <BarChart3 className="h-4 w-4" />
            View Results
          </Button>

          <Button
            onClick={() => navigate("/mismatch")}
            className="w-full flex items-center gap-2"
            variant="secondary"
          >
            <BarChart3 className="h-4 w-4" />
            View Mismatches
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
