"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Upload,
} from "lucide-react";

// Initial gallery data
const initialGalleryImages = [
  {
    id: 1,
    title: "Training Session",
    description: "Professional training and development sessions for students",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    order: 1,
  },
  {
    id: 2,
    title: "Study Environment",
    description: "Modern study environment for focused learning",
    image: "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&auto=format&fit=crop&q=60",
    order: 2,
  },
  {
    id: 3,
    title: "Student Life",
    description: "Vibrant student life and activities",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60",
    order: 3,
  },
];

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image: string;
  order: number;
}

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>(initialGalleryImages);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newImage, setNewImage] = useState<Partial<GalleryImage>>({
    title: "",
    description: "",
    image: "",
  });

  const handleSave = (id: number) => {
    setIsEditing(null);
    // Here you would typically save to your backend
    console.log("Saving image:", images.find((img) => img.id === id));
  };

  const handleAdd = () => {
    const newId = Math.max(...images.map((img) => img.id)) + 1;
    const newOrder = Math.max(...images.map((img) => img.order)) + 1;
    setImages([
      ...images,
      { ...newImage as GalleryImage, id: newId, order: newOrder },
    ]);
    setIsAddingNew(false);
    setNewImage({
      title: "",
      description: "",
      image: "",
    });
  };

  const handleDelete = (id: number) => {
    setImages(images.filter((image) => image.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index], newImages[index - 1]] = [
      newImages[index - 1],
      newImages[index],
    ];
    setImages(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];
    setImages(newImages);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newImage.title}
                  onChange={(e) =>
                    setNewImage({ ...newImage, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newImage.description}
                  onChange={(e) =>
                    setNewImage({ ...newImage, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newImage.image}
                  onChange={(e) =>
                    setNewImage({ ...newImage, image: e.target.value })
                  }
                />
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop your image here, or click to select a file
                </p>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Image
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.map((image, index) => (
                <TableRow key={image.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="relative h-12 w-20 rounded overflow-hidden">
                      <img
                        src={image.image}
                        alt={image.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {isEditing === image.id ? (
                      <Input
                        value={image.title}
                        onChange={(e) =>
                          setImages(
                            images.map((img) =>
                              img.id === image.id
                                ? { ...img, title: e.target.value }
                                : img
                            )
                          )
                        }
                      />
                    ) : (
                      image.title
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === image.id ? (
                      <Input
                        value={image.description}
                        onChange={(e) =>
                          setImages(
                            images.map((img) =>
                              img.id === image.id
                                ? { ...img, description: e.target.value }
                                : img
                            )
                          )
                        }
                      />
                    ) : (
                      image.description
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === images.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      {isEditing === image.id ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSave(image.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsEditing(image.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
              >
                <img
                  src={image.image}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-semibold">{image.title}</h3>
                    <p className="text-sm opacity-90">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}