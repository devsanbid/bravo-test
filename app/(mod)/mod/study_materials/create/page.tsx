"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload } from "lucide-react";

export default function CreateStudyMaterialPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    
    if (!title || !description || !category || !file) {
      toast.error("Please fill in all fields and upload a file");
      return;
    }
    
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("file", file);
      
      const response = await fetch("/api/study-materials/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload study material");
      }
      
      toast.success("Study material uploaded successfully");
      router.push("/mod/study_materials");
    } catch (error) {
      console.error("Error uploading study material:", error);
      toast.error("Failed to upload study material");
    } finally {
      setLoading(false);
    }
  };

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
          <CardTitle>Add New Study Material</CardTitle>
          <CardDescription>
            Upload study materials for students to access. Supported file types include PDFs, documents, presentations, and images.
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
              <Label htmlFor="file">Upload File</Label>
              <div className="border rounded-md p-4">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="mb-2"
                  required
                />
                {file && (
                  <div className="text-sm text-muted-foreground mt-2">
                    <p><strong>File:</strong> {file.name}</p>
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
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Study Material
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
