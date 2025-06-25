"use client";

import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { AlertCircle, Loader2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { useWireType } from "../AppContexts";
import WirePreviewPanel from "./WirePreviewPanel";

export default function SelectItemPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  const [data, setData] = useState<Wire[]>([]);
  const { selectedWireType, setSelectedWireType } = useWireType();
  const [selectedWireId, setSelectedWireId] = useState<number | null>(null);
  const [selectedWireImages, setSelectedWireImages] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currRow, setCurrRow] = useState<Wire | null>(null);

  const fetchWireData = async () => {
    setIsLoadingData(true);
    setError(null);
    try {
      const result = await window.electron.fetchData<Wire>("wires", selectedWireType);
      setData(result);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items. Please try again.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchCurrRow = async (id: number) => {
    try{
      const result = await window.electron.fetchRow<Wire>("wires", id);
      setCurrRow(result);
    } catch(err){
      console.log("Error fetching row:", err);
    }
  }

  const removeItem = async (id: number) => {
    try {
      await window.electron.removeItem("wires", id);
      await fetchWireData();

      // Clear selection if the removed item was selected
      if (selectedWireId === id) {
        setSelectedWireId(null);
        setSelectedWireImages([]);
      }
    } catch (error) {
      console.error("Error removing items:", error);
      setError("Failed to remove item. Please try again.");
    }
  };

  const fetchWireImage = async (id: number) => {
    setIsLoadingImage(true);
    try {
      const result = await window.electron.fetchImages("wires", selectedWireType, id);
      if (result) return result;
    } catch (error) {
      console.error("Error fetching wire image:", error);
      setError("Failed to load image. Please try again.");
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleTestClick = () => {
    if (!selectedWireId) {
      setError("Please select an item to test.");
      return;
    }
    if(!currRow) return;
    const rgbArray = JSON.parse(currRow.sequence).map((arr: string) => JSON.parse(arr));
    let wireCount = []
    if(selectedWireType === "singlewire"){
      wireCount.push(rgbArray[0].length);
    } else{
      wireCount.push(rgbArray[0].length);
      wireCount.push(rgbArray[1].length);
    }

    navigate(`/test-item/${selectedWireType}/${selectedWireId}`, {
      state: {
        wireCount: wireCount
      }
    });
  };

  const handleAddClick = () => {
    navigate(`/add-item/${selectedWireType}`);
  };

  const handleTabChange = (value: string) => {
    setSelectedWireType(value);
    setSelectedWireId(null); // Clear selection when switching tabs
    setSelectedWireImages([]); // Clear images when switching tabs
  };

  // Load initial data
  useEffect(() => {
    fetchWireData();
  }, []);

  // Load data when wire type changes
  useEffect(() => {
    fetchWireData();
    setSelectedWireId(null);
  }, [selectedWireType]);

  // Load images when item is selected
  useEffect(() => {
    const loadData = async () => {
      if (selectedWireId) {
        const images = await fetchWireImage(selectedWireId);
        await fetchCurrRow(selectedWireId);
        if (images) {
          setSelectedWireImages(images);
        }
      } else {
        setSelectedWireImages([]);
      }
    };

    loadData();
  }, [selectedWireId, selectedWireType]);

  return (
    <div className="min-h-screen bg-blac p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-50 mb-2">
            Select Item for Testing
          </h1>
          <p className="text-gray-300">
            Choose a wire type, select an item, and start testing
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wire Type Tabs */}
        <Tabs
          value={selectedWireType}
          onValueChange={handleTabChange}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="singlewire">Single Wire</TabsTrigger>
              <TabsTrigger value="doublewire">Double Wire</TabsTrigger>
            </TabsList>
            <Badge variant="secondary">
              {data.length} item{data.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <TabsContent value="singlewire" className="mt-0">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Panel - Controls and Image Preview */}
              <div className="lg:col-span-2 space-y-6">
                <WirePreviewPanel
                  selectedWireId={selectedWireId}
                  selectedWireImages={selectedWireImages}
                  isDoubleWire={selectedWireType === "doublewire"}
                  isLoadingImage={isLoadingImage}
                  onAddClick={handleAddClick}
                  onTestClick={handleTestClick}
                />
              </div>
              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Single Wire Items</span>
                      <div className="flex items-center gap-2">
                        {isLoadingData && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">
                            Loading items...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, {
                          selectedWireId,
                          setSelectedWireId,
                        })}
                        data={data}
                        selectionActions={{ selectedWireId, setSelectedWireId }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="doublewire" className="mt-0">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Panel - Controls and Image Preview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Preview */}
                <WirePreviewPanel
                  selectedWireId={selectedWireId}
                  selectedWireImages={selectedWireImages}
                  isDoubleWire={selectedWireType === "doublewire"}
                  isLoadingImage={isLoadingImage}
                  onAddClick={handleAddClick}
                  onTestClick={handleTestClick}
                />
              </div>

              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Double Wire Items</span>
                      <div className="flex items-center gap-2">
                        {isLoadingData && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">
                            Loading items...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, {
                          selectedWireId,
                          setSelectedWireId,
                        })}
                        data={data}
                        selectionActions={{ selectedWireId, setSelectedWireId }}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
