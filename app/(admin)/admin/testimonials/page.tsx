"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Star,
  MoveUp,
  MoveDown,
  Upload,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Initial testimonials data
const initialTestimonials = [
  {
    id: 1,
    name: "Smarika Chauhan",
    institution: "Texas A&M University Texarkana (USA)",
    rating: 5,
    text: "My counselor was beneficial during my visa process. He promptly answered all my queries as a student applying for a visa during the pandemic. I was nervous but Sir's positive attitude can instantly put one at ease.",
    image: "/placeholder.svg?height=80&width=80",
    order: 1,
  },
  {
    id: 2,
    name: "Aarju Karki",
    institution: "Southern Illinois University Edwardsville",
    rating: 4,
    text: "Thank you for providing me with such a great opportunity to study abroad. I would like to thank the team of Alfa Beta who was helpful and guided throughout the process. Your service has been amazing so far.",
    image: "/placeholder.svg?height=80&width=80",
    order: 2,
  },
  {
    id: 3,
    name: "Aashish Poudel",
    institution: "Hayes Valdez",
    rating: 5,
    text: "I would like to thank Alfa Beta Institute and especially Miss. Kritisha Karki for the successful completion of my visa grant process. It was very difficult for me to get an Australian student visa without the cooperation and help of the Alfa Beta family.",
    image: "/placeholder.svg?height=80&width=80",
    order: 3,
  },
];

interface Testimonial {
  id: number;
  name: string;
  institution: string;
  rating: number;
  text: string;
  image: string;
  order: number;
}

export default function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: "",
    institution: "",
    rating: 5,
    text: "",
    image: "",
  });

  const handleSave = (id: number) => {
    setIsEditing(null);
    // Here you would typically save to your backend
    console.log("Saving testimonial:", testimonials.find((t) => t.id === id));
  };

  const handleAdd = () => {
    const newId = Math.max(...testimonials.map((t) => t.id)) + 1;
    const newOrder = Math.max(...testimonials.map((t) => t.order)) + 1;
    setTestimonials([
      ...testimonials,
      { ...newTestimonial as Testimonial, id: newId, order: newOrder },
    ]);
    setIsAddingNew(false);
    setNewTestimonial({
      name: "",
      institution: "",
      rating: 5,
      text: "",
      image: "",
    });
  };

  const handleDelete = (id: number) => {
    setTestimonials(testimonials.filter((testimonial) => testimonial.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newTestimonials = [...testimonials];
    [newTestimonials[index], newTestimonials[index - 1]] = [
      newTestimonials[index - 1],
      newTestimonials[index],
    ];
    setTestimonials(newTestimonials);
  };

  const handleMoveDown = (index: number) => {
    if (index === testimonials.length - 1) return;
    const newTestimonials = [...testimonials];
    [newTestimonials[index], newTestimonials[index + 1]] = [
      newTestimonials[index + 1],
      newTestimonials[index],
    ];
    setTestimonials(newTestimonials);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Testimonials Management</h1>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Testimonial</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newTestimonial.name}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={newTestimonial.institution}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, institution: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={newTestimonial.rating}
                  onChange={(e) =>
                    setNewTestimonial({
                      ...newTestimonial,
                      rating: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Testimonial Text</Label>
                <Textarea
                  id="text"
                  value={newTestimonial.text}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, text: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image URL</Label>
                <Input
                  id="image"
                  value={newTestimonial.image}
                  onChange={(e) =>
                    setNewTestimonial({ ...newTestimonial, image: e.target.value })
                  }
                />
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag and drop profile image here, or click to select a file
                </p>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Testimonial
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Testimonial</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial, index) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {isEditing === testimonial.id ? (
                      <Input
                        value={testimonial.name}
                        onChange={(e) =>
                          setTestimonials(
                            testimonials.map((t) =>
                              t.id === testimonial.id
                                ? { ...t, name: e.target.value }
                                : t
                            )
                          )
                        }
                      />
                    ) : (
                      testimonial.name
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing === testimonial.id ? (
                      <Input
                        value={testimonial.institution}
                        onChange={(e) =>
                          setTestimonials(
                            testimonials.map((t) =>
                              t.id === testimonial.id
                                ? { ...t, institution: e.target.value }
                                : t
                            )
                          )
                        }
                      />
                    ) : (
                      testimonial.institution
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {isEditing === testimonial.id ? (
                      <Textarea
                        value={testimonial.text}
                        onChange={(e) =>
                          setTestimonials(
                            testimonials.map((t) =>
                              t.id === testimonial.id
                                ? { ...t, text: e.target.value }
                                : t
                            )
                          )
                        }
                      />
                    ) : (
                      <p className="line-clamp-2">{testimonial.text}</p>
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
                        disabled={index === testimonials.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      {isEditing === testimonial.id ? (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSave(testimonial.id)}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setIsEditing(testimonial.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(testimonial.id)}
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
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-xl border bg-card text-card-foreground shadow"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-orange-600">{testimonial.institution}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 line-clamp-4">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}