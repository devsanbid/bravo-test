"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
} from "lucide-react";

// Mock data for slider images
const initialSlides = [
  {
    id: 1,
    title: "Training Session",
    description: "Professional training and development sessions for students",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
    order: 1,
  },
  {
    id: 2,
    title: "Study Abroad",
    description: "International education opportunities",
    image: "/placeholder.svg?height=600&width=1200",
    order: 2,
  },
  {
    id: 3,
    title: "Test Preparation",
    description: "Expert guidance for international exams",
    image: "/placeholder.svg?height=600&width=1200",
    order: 3,
  },
];

export default function SliderManagement() {
  const [slides, setSlides] = useState(initialSlides);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
    setSlides(newSlides);
  };

  const handleMoveDown = (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    setSlides(newSlides);
  };

  const handleDelete = (id: number) => {
    setSlides(slides.filter(slide => slide.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Slider Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Slide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter slide title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" placeholder="Enter slide description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" placeholder="Enter image URL" />
              </div>
              <Button className="w-full">Add Slide</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Slides</CardTitle>
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
              {slides.map((slide, index) => (
                <TableRow key={slide.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-20 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell>{slide.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {slide.description}
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
                        disabled={index === slides.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingSlide(slide)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(slide.id)}
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
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
            {slides.length > 0 && (
              <img
                src={slides[0].image}
                alt={slides[0].title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/30">
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 text-white">
                <h3 className="text-xl font-bold">{slides[0]?.title}</h3>
                <p className="mt-2 text-sm text-gray-200">
                  {slides[0]?.description}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}