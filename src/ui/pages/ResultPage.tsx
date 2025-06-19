"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { columns } from "./result-table/columns"
import { DataTable } from "./result-table/data-table"
import { ImageIcon, AlertCircle, Loader2 } from "lucide-react"
import BackButton from "@/components/ui/BackButton"

export default function ResultPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [data, setData] = useState<ResultRow[]>([])
  const [selectedWireType, setSelectedWireType] = useState<string>("singlewire")
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null)
  const [selectedWireImages, setSelectedWireImages] = useState<string[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultDetails, setResultDetails] = useState<string | null>(null)

  const isDoubleWire = selectedWireType === "doublewire"

  const fetchResultData = async () => {
    setIsLoadingData(true)
    setError(null)
    try {
      console.log("selectedWireType:", selectedWireType, typeof selectedWireType)

      const result = await window.electron.fetchResults(selectedWireType)
      setData(result)
      console.log(result)
    } catch (error) {
      console.error("Error fetching items:", error)
      setError("Failed to load items. Please try again.")
    } finally {
      setIsLoadingData(false)
    }
  }

  const removeItem = async (id: number) => {
    try {
      await window.electron.removeItem("results", id)
      await fetchResultData()

      // Clear selection if the removed item was selected
      if (selectedResultId === id) {
        setSelectedResultId(null)
        setSelectedWireImages([])
      }
    } catch (error) {
      console.error("Error removing items:", error)
      setError("Failed to remove item. Please try again.")
    }
  }

  const fetchResultWireImage = async (id: number) => {
    setIsLoadingImage(true)
    try {
      console.log("CALLING WIRE IMAGE: ", id)
      const result = await window.electron.fetchResultWireImage(id)

      if (result) return result;
    } catch (error) {
      console.error("Error fetching wire image:", error)
      setError("Failed to load image. Please try again.")
    } finally {
      setIsLoadingImage(false)
    }
  }

  const handleTabChange = (value: string) => {
    setSelectedWireType(value)
    setSelectedResultId(null) // Clear selection when switching tabs
    setSelectedWireImages([]) // Clear images when switching tabs
    setResultDetails(null) // Clear result details when switching tabs
  }

  // Load initial data
  useEffect(() => {
    fetchResultData()
  }, [])

  // Load data when wire type changes
  useEffect(() => {
    fetchResultData()
  }, [selectedWireType])

  // Load images when item is selected
  useEffect(() => {
    const loadData = async () => {
      if (selectedResultId) {
        const images = await fetchResultWireImage(selectedResultId)
        const details = await window.electron.fetchResultDetails(selectedResultId)
        if (images) {
          setSelectedWireImages(images)
        }
        if (details) setResultDetails(details)
      } else {
        setSelectedWireImages([])
        setResultDetails(null)
      }
    }

    loadData()
  }, [selectedResultId, selectedWireType])

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
          <h1 className="text-2xl font-bold text-gray-50 mb-2">Results</h1>
          <p className="text-gray-300">Results of previously tested wires.</p>
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
                                alt={`${getImageLabel(index)} of ${selectedResultId}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedResultId ? (
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

                {/* Result Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold">Result Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-300">{resultDetails}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">Loading items...</p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, { selectedResultId, setSelectedResultId })}
                        data={data}
                        selectionActions={{ selectedResultId, setSelectedResultId }}
                      />
                    )}
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
                                alt={`${getImageLabel(index)} of ${selectedResultId}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedResultId ? (
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

                {/* Result Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bold">Result Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-300">{resultDetails}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Data Table */}
              <div className="lg:col-span-3">
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                          <p className="text-sm text-gray-600">Loading items...</p>
                        </div>
                      </div>
                    ) : (
                      <DataTable
                        columns={columns(removeItem, { selectedResultId, setSelectedResultId })}
                        data={data}
                        selectionActions={{ selectedResultId, setSelectedResultId }}
                      />
                    )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  )
}