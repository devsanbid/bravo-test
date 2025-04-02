"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, ArrowLeft, Calendar, Clock } from 'lucide-react';
import { toast } from "sonner";
import { fetchStudyMaterialById, formatFileSize, getFileIcon } from "@/lib/client/study-materials";
import type { StudyMaterial } from "@/lib/client/study-materials";

export default function StudyMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const materialId = params.id as string;

  useEffect(() => {
    async function fetchMaterial() {
      try {
        setLoading(true);
        const data = await fetchStudyMaterialById(materialId);
        setMaterial(data);
      } catch (error) {
        console.error("Error fetching study material:", error);
        toast.error("Failed to load study material");
      } finally {
        setLoading(false);
      }
    }

    if (materialId) {
      fetchMaterial();
    }
  }, [materialId]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="p-10 flex justify-center items-center h-64">
        <p>Loading study material...</p>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-10">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Study Materials
        </Button>
        <div className="text-center p-8 border rounded-md">
          <p className="text-gray-500">Study material not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Study Materials
      </Button>

      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{material.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="capitalize">{material.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Added on {formatDate(material.createdAt)}</span>
            </div>
          </div>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <p className="mb-6">{material.description}</p>
            
            <div className="border rounded-md p-4 bg-background">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getFileIcon(material.fileType)}</span>
                <div className="flex-1">
                  <p className="font-medium">{material.fileName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{material.fileType}</span>
                    <span>•</span>
                    <span>{formatFileSize(material.fileSize)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild className="flex-1 sm:flex-none">
            <a 
              href={material.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              View File
            </a>
          </Button>
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <a 
              href={material.fileUrl} 
              download 
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download File
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
