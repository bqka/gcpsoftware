"use client"

import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "./wire-table/columns"
import { DataTable } from "./wire-table/data-table"
import { Plus, TestTube, ImageIcon, AlertCircle, Loader2, BarChart3 } from "lucide-react"
import BackButton from "@/components/ui/BackButton"

interface SingleWire {
  id: number
  sequence: string
  created_at: string
  // Add other properties as needed
}

export default function SelectItemPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const navigate = useNavigate()

  const [data, setData] = useState<SingleWire[]>([])
  const [selectedWireType, setSelectedWireType] = useState<string>("singlewire")
  const [selectedWireId, setSelectedWireId] = useState<number | null>(null)
  const [selectedWireImages, setSelectedWireImages] = useState<string[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDoubleWire = selectedWireType === "doublewire"

  const fetchWireData = async (tableName: string) => {
    setIsLoadingData(true)
    setError(null)
    try {
      const result = await window.electron.fetchWireData(tableName)
      setData(result)
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items. Please try again.")
    } finally {
      setIsLoadingData(false)
    }
  }

  const removeItem = async (id: number) => {
    try {
      await window.electron.removeItem(selectedWireType, id)
      await fetchWireData(selectedWireType)

      // Clear selection if the removed item was selected
      if (selectedWireId === id) {
        setSelectedWireId(null)
        setSelectedWireImages([])
      }
    } catch (error) {
      console.error("Error removing items:", error)
      setError("Failed to remove item. Please try again.")
    }
  }

  const fetchWireImage = async (id: number, wireType: string) => {
    setIsLoadingImage(true)
    try {
      const result = await window.electron.fetchWireImage(id, wireType)
      if (result) return result
    } catch (error) {
      console.error("Error fetching wire image:", error)
      setError("Failed to load image. Please try again.")
    } finally {
      setIsLoadingImage(false)
    }
  }

  const handleTestClick = () => {
    if (!selectedWireId) {
      setError("Please select an item to test.")
      return
    }
    navigate(`/test-item/${selectedWireType}/${selectedWireId}`)
  }

  const handleAddClick = () => {
    navigate(`/add-item/${selectedWireType}`)
  }

  const handleTabChange = (value: string) => {
    setSelectedWireType(value)
    setSelectedWireId(null) // Clear selection when switching tabs
    setSelectedWireImages([]) // Clear images when switching tabs
  }

  // Load initial data
  useEffect(() => {
    fetchWireData("singlewire")
  }, [])

  // Load data when wire type changes
  useEffect(() => {
    fetchWireData(selectedWireType)
  }, [selectedWireType])

  // Load images when item is selected
  useEffect(() => {
    const loadImages = async () => {
      if (selectedWireId) {
        const images = await fetchWireImage(selectedWireId, selectedWireType)
        if (images) {
          setSelectedWireImages(images)
        }
      } else {
        setSelectedWireImages([])
      }
    }

    loadImages()
  }, [selectedWireId, selectedWireType])

  const getImageLabel = (index: number) => {
    if (isDoubleWire) {
      return index === 0 ? "Front View" : "Back View"
    }
    return "Single View"
  }

  return (
    <div className="min-h-screen bg-blac p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-50 mb-2">Select Item for Testing</h1>
          <p className="text-gray-300">Choose a wire type, select an item, and start testing</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wire Type Tabs */}
        <Tabs value={selectedWireType} onValueChange={handleTabChange} className="mb-6">
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
                {/* Image Preview */}
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
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {getImageLabel(index)}
                              </Badge>
                            </div>
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

                {/* Action Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleAddClick} className="w-full flex items-center gap-2" variant="outline">
                      <Plus className="h-4 w-4" />
                      Add New Single Wire
                    </Button>

                    <Button
                      onClick={handleTestClick}
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Single Wire Items</span>
                      <div className="flex items-center gap-2">
                        {isLoadingData && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">Loading items...</p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, { selectedWireId, setSelectedWireId })}
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
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {getImageLabel(index)}
                              </Badge>
                            </div>
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

                {/* Action Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleAddClick} className="w-full flex items-center gap-2" variant="outline">
                      <Plus className="h-4 w-4" />
                      Add New Double Wire
                    </Button>

                    <Button
                      onClick={handleTestClick}
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
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Double Wire Items</span>
                      <div className="flex items-center gap-2">
                        {isLoadingData && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">Loading items...</p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, { selectedWireId, setSelectedWireId })}
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
  )
}