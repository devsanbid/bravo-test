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
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  FormInput,
  Plus,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Initial services data
const initialServices = [
  {
    id: 1,
    icon: "GraduationCap",
    title: "Study Abroad",
    description:
      "Study Abroad - Start your journey with Alfa Beta. As the leading overseas education consultancy in Nepal, we guide you to...",
    isActive: true,
  },
  {
    id: 2,
    icon: "ClipboardCheck",
    title: "Mock Test",
    description:
      "Elevate Your Test Preparation Journey with Alfa Beta's Comprehensive Program. Are you gearing up for the IELTS, TOEFL, SAT, or PTE exams?",
    isActive: true,
  },
  {
    id: 3,
    icon: "BookOpen",
    title: "Test Preparation",
    description:
      "Alfa Beta's Test Preparation Excellence: A Gateway to Success. Unlock your full potential with our meticulously designed courses.",
    isActive: true,
  },
  {
    id: 4,
    icon: "FormInput",
    title: "Test Registration",
    description:
      "Unlock your academic future with Alfa Beta's Test Registration services, tailored to streamline your journey toward success.",
    isActive: true,
  },
];

const iconComponents = {
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  FormInput,
};

type IconType = keyof typeof iconComponents;

interface Service {
  id: number;
  icon: IconType;
  title: string;
  description: string;
  isActive: boolean;
}

export default function ServicesManagement() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    icon: "GraduationCap",
    title: "",
    description: "",
    isActive: true,
  });

  const handleSave = (id: number) => {
    setIsEditing(null);
    // Here you would typically save to your backend
    console.log("Saving service:", services.find(s => s.id === id));
  };

  const handleAdd = () => {
    const newId = Math.max(...services.map(s => s.id)) + 1;
    setServices([...services, { ...newService as Service, id: newId }]);
    setIsAddingNew(false);
    setNewService({
      icon: "GraduationCap",
      title: "",
      description: "",
      isActive: true,
    });
  };

  const handleDelete = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleToggleActive = (id: number) => {
    setServices(services.map(service =>
      service.id === id ? { ...service, isActive: !service.isActive } : service
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={newService.icon}
                  onChange={(e) => setNewService({ ...newService, icon: e.target.value as IconType })}
                >
                  {Object.keys(iconComponents).map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Service</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const IconComponent = iconComponents[service.icon];
                return (
                  <TableRow key={service.id}>
                    <TableCell>
                      <IconComponent className="h-5 w-5" />
                    </TableCell>
                    <TableCell>
                      {isEditing === service.id ? (
                        <Input
                          value={service.title}
                          onChange={(e) =>
                            setServices(services.map(s =>
                              s.id === service.id ? { ...s, title: e.target.value } : s
                            ))
                          }
                        />
                      ) : (
                        service.title
                      )}
                    </TableCell>
                    <TableCell className="max-w-md">
                      {isEditing === service.id ? (
                        <Textarea
                          value={service.description}
                          onChange={(e) =>
                            setServices(services.map(s =>
                              s.id === service.id ? { ...s, description: e.target.value } : s
                            ))
                          }
                        />
                      ) : (
                        <p className="line-clamp-2">{service.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        className={cn(
                          "px-2 font-normal",
                          service.isActive
                            ? "text-green-600 hover:text-green-700"
                            : "text-red-600 hover:text-red-700"
                        )}
                        onClick={() => handleToggleActive(service.id)}
                      >
                        {service.isActive ? "Active" : "Inactive"}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isEditing === service.id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave(service.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(service.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.filter(service => service.isActive).map((service) => {
              const IconComponent = iconComponents[service.icon];
              return (
                <div
                  key={service.id}
                  className="relative rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}