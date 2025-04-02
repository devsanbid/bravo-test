"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Trash2, Edit, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  fetchStudyMaterials, 
  deleteStudyMaterial, 
  formatFileSize, 
  getFileIcon,
  type StudyMaterial 
} from "@/lib/client/study-materials";

export default function ModStudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch study materials
  useEffect(() => {
    async function fetchMaterials() {
      try {
        setLoading(true);
        const data = await fetchStudyMaterials(100, 0);
        setMaterials(data);
      } catch (error) {
        console.error("Error fetching study materials:", error);
        toast.error("Failed to load study materials");
      } finally {
        setLoading(false);
      }
    }

    fetchMaterials();
  }, []);

  // Delete a study material
  const handleDelete = async (id: string, fileId: string) => {
    try {
      await deleteStudyMaterial(id, fileId);
      setMaterials(materials.filter(material => material.$id !== id));
      toast.success("Study material deleted successfully");
    } catch (error) {
      console.error("Error deleting study material:", error);
      toast.error("Failed to delete study material");
    }
  };

  // Filter materials by search query and category
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

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Study Materials Management</h1>
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
          <Button onClick={() => router.push('/mod/study_materials/create')} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-6" onValueChange={setActiveCategory}>
        <TabsList className="mb-4 flex flex-wrap">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

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
                <Card key={material.$id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold line-clamp-1">{material.title}</CardTitle>
                      <Badge variant="outline" className="capitalize">{material.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{material.description}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">{getFileIcon(material.fileType)}</span>
                      <span className="truncate flex-1">{material.fileName}</span>
                      <span className="ml-2 text-xs">{formatFileSize(material.fileSize)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          View
                        </a>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/mod/study_materials/update/${material.$id}`)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Are you sure you want to delete this material?</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <p>This action cannot be undone. This will permanently delete the study material.</p>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => document.querySelector('[data-state="open"] button[aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>
                            Cancel
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => {
                              handleDelete(material.$id, material.fileId);
                              document.querySelector('[data-state="open"] button[aria-label="Close"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
