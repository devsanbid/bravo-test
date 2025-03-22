"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// Using fetch API instead of direct server imports
import { useAuthStore } from "@/lib/stores/auth_store";

interface PageProps {
  params: {
    id: string;
  };
}

export default function UpdateImagePage({ params }: PageProps) {
  const { id } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const authStore = useAuthStore();

  useEffect(() => {
    async function fetchImage() {
      try {
        setLoading(true);
        const response = await fetch(`/api/gallery/update?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }
        
        const image = await response.json();
        setTitle(image.title);
        setDescription(image.description);
        setCurrentImageUrl(image.imageUrl);
      } catch (error) {
        console.error("Error fetching image:", error);
        toast.error("Failed to load image data");
        router.push("/mod/gallery");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchImage();
    }
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setSaving(true);
      // Create a FormData object to send the file and metadata
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      if (file) {
        formData.append('file', file);
      }
      
      // Send the data to the API route
      const response = await fetch(`/api/gallery/update?id=${id}`, {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to update image');
      }
      toast.success("Image updated successfully!");
      router.push("/mod/gallery");
    } catch (error) {
      console.error("Error updating image:", error);
      toast.error("Failed to update image. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-64">
        <p>Loading image data...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Update Image</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Gallery
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter image title"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter image description"
            rows={4}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image (Optional)</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="mt-4 border rounded-md p-2">
            <p className="text-sm text-gray-500 mb-2">Current Image:</p>
            <img
              src={preview || currentImageUrl || ""}
              alt="Current"
              className="max-h-64 rounded-md mx-auto"
            />
            {preview && (
              <p className="text-xs text-gray-400 mt-2 text-center">
                New image selected (not saved yet)
              </p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Update Image"}
          </Button>
        </div>
      </form>
    </div>
  );
}
