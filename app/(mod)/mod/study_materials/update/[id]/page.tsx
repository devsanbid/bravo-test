"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, FileText, Save } from "lucide-react";

interface StudyMaterial {
  $id: string;
  title: string;
  description: string;
  category: string;
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  userId: string;
}

export default function UpdateStudyMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const categories = [
    "IELTS",
    "PTE",
    "GRE",
    "SAT",
    "TOEFL",
    "General English",
    "Grammar",
    "Vocabulary",
    "Reading",
    "Writing",
    "Speaking",
    "Listening",
    "Other"
  ];

  // Fetch the study material
  useEffect(() => {
    async function fetchMaterial() {
      try {
        setLoading(true);
        const response = await fetch(`/api/study-materials/update?id=${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch study material');
        }
        
        const data = await response.json();
        setMaterial(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
      } catch (error) {
        console.error("Error fetching study material:", error);
        toast.error("Failed to load study material");
        router.push("/mod/study_materials");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchMaterial();
    }
  }, [params.id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFilePreview(event.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      if (file) {
        formData.append("file", file);
      }
      
      const response = await fetch(`/api/study-materials/update?id=${params.id}`, {
        method: "PATCH",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update study material");
      }
      
      toast.success("Study material updated successfully");
      router.push("/mod/study_materials");
    } catch (error) {
      console.error("Error updating study material:", error);
      toast.error("Failed to update study material");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-6 flex justify-center items-center min-h-[60vh]">
        <p>Loading study material...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container py-6 flex justify-center items-center min-h-[60vh]">
        <p>Study material not found</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button 
        variant="ghost" 
        className="mb-6 flex items-center gap-2"
        onClick={() => router.push("/mod/study_materials")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Materials
      </Button>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Update Study Material</CardTitle>
          <CardDescription>
            Edit the details of the study material. Leave the file field empty if you don't want to change the current file.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide a brief description of the study material"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Current File</Label>
              <div className="border rounded-md p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{material.fileName}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <p><strong>Size:</strong> {(material.fileSize / 1024).toFixed(1)} KB</p>
                  <p><strong>Type:</strong> {material.fileType}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  asChild
                >
                  <a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">Replace File (Optional)</Label>
              <div className="border rounded-md p-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="mb-2"
                />
                {file && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p><strong>New File:</strong> {file.name}</p>
                    <p><strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB</p>
                    <p><strong>Type:</strong> {file.type}</p>
                  </div>
                )}
                {filePreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview:</p>
                    <img 
                      src={filePreview} 
                      alt="File preview" 
                      className="max-h-40 max-w-full object-contain border rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
