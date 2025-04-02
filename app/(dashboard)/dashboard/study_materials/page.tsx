"use client"
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  BookmarkPlus,
  NotepadText,
  ListCheck,
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  fetchStudyMaterials, 
  formatFileSize, 
  getFileIcon,
  getStudyMaterialCategories,
  type StudyMaterial 
} from "@/lib/client/study-materials";

const StudyMaterials = () => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);
  const [featuredMaterials, setFeaturedMaterials] = useState<StudyMaterial[]>([]);

  // Fetch study materials
  useEffect(() => {
    async function fetchMaterials() {
      try {
        setLoading(true);
        const data = await fetchStudyMaterials(100, 0);
        setMaterials(data);
        
        // Set featured materials (most recent 3)
        if (data.length > 0) {
          setFeaturedMaterials(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching study materials:", error);
        toast.error("Failed to load study materials");
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // Filter materials by category and search query
  const filteredMaterials = materials
    .filter(material => activeCategory === "all" || material.category.toLowerCase() === activeCategory.toLowerCase())
    .filter(material => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        material.title.toLowerCase().includes(query) ||
        material.description.toLowerCase().includes(query) ||
        material.fileName.toLowerCase().includes(query) ||
        material.category.toLowerCase().includes(query)
      );
    });

  // Get all unique categories
  const uniqueCategories = Array.from(new Set(materials.map(material => material.category.toLowerCase())));
  const categories = ["all", ...uniqueCategories];
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // View material details
  const viewMaterialDetails = (material: StudyMaterial) => {
    setSelectedMaterial(material);
  };
  return (
    <div className="space-y-6 p-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search materials..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {featuredMaterials.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredMaterials.map((material) => (
              <Card 
                key={`featured-${material.$id}`} 
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewMaterialDetails(material)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-1">{material.title}</CardTitle>
                    <Badge variant="secondary" className="capitalize">{material.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{material.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(material.createdAt)}</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      viewMaterialDetails(material);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <TabsList className="w-full sm:w-auto overflow-x-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeCategory} className="mt-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading study materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <p className="text-gray-500">No study materials available in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.map((material) => (
                <Card 
                  key={material.$id} 
                  className="overflow-hidden flex flex-col hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => viewMaterialDetails(material)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{material.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">{material.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{material.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">{getFileIcon(material.fileType)}</span>
                      <span className="truncate flex-1">{material.fileName}</span>
                      <span className="ml-2 text-xs">{formatFileSize(material.fileSize)}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(material.createdAt)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a 
                          href={material.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="h-4 w-4" />
                          View
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a 
                          href={material.fileUrl} 
                          download 
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedMaterial && (
        <Dialog open={!!selectedMaterial} onOpenChange={() => setSelectedMaterial(null)}>
          <DialogContent className="max-w-3xl">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{selectedMaterial.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">{selectedMaterial.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(selectedMaterial.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground">{selectedMaterial.description}</p>
              
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{selectedMaterial.fileName}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <p><strong>Size:</strong> {formatFileSize(selectedMaterial.fileSize)}</p>
                  <p><strong>Type:</strong> {selectedMaterial.fileType}</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button asChild className="flex-1">
                  <a href={selectedMaterial.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" />
                    View File
                  </a>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <a href={selectedMaterial.fileUrl} download className="flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default StudyMaterials;
