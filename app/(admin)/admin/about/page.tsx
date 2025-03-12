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
import { ImagePlus, Save, Upload } from "lucide-react";

// Mock data for about section
const initialAboutData = {
  title: "We Are Increasing Business Success With Technology",
  subtitle: "ABOUT US",
  description: [
    "Over 10+ years working in IT services developing software applications and mobile apps for clients all over the world.",
    "Bravos International provides superior Designing, Development, Consulting and Marketing Solutions and Services in the IT industry, Serving both the Domestic and International Sectors.",
  ],
  stats: [
    { label: "Happy Clients", value: "15k+" },
    { label: "Companies", value: "30+" },
    { label: "Projects Done", value: "30+" },
  ],
  image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60",
};

export default function AboutManagement() {
  const [aboutData, setAboutData] = useState(initialAboutData);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log("Saving about data:", aboutData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">About Section Management</h1>
        <div className="flex gap-2">
          {isEditing ? (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Content</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Content Section */}
        <Card>
          <CardHeader>
            <CardTitle>Main Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={aboutData.subtitle}
                onChange={(e) =>
                  setAboutData({ ...aboutData, subtitle: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={aboutData.title}
                onChange={(e) =>
                  setAboutData({ ...aboutData, title: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description1">Description (Paragraph 1)</Label>
              <Textarea
                id="description1"
                value={aboutData.description[0]}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    description: [e.target.value, aboutData.description[1]],
                  })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description2">Description (Paragraph 2)</Label>
              <Textarea
                id="description2"
                value={aboutData.description[1]}
                onChange={(e) =>
                  setAboutData({
                    ...aboutData,
                    description: [aboutData.description[0], e.target.value],
                  })
                }
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden border">
              <img
                src={aboutData.image}
                alt="About section"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="absolute bottom-4 right-4 gap-2"
                      variant="secondary"
                    >
                      <ImagePlus className="h-4 w-4" /> Change Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                          placeholder="Enter image URL"
                          value={aboutData.image}
                          onChange={(e) =>
                            setAboutData({ ...aboutData, image: e.target.value })
                          }
                        />
                      </div>
                      <div className="border-2 border-dashed rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Drag and drop your image here, or click to select a file
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {aboutData.stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <Label>Statistic {index + 1}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Label"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index] = {
                          ...stat,
                          label: e.target.value,
                        };
                        setAboutData({ ...aboutData, stats: newStats });
                      }}
                      disabled={!isEditing}
                    />
                    <Input
                      placeholder="Value"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...aboutData.stats];
                        newStats[index] = {
                          ...stat,
                          value: e.target.value,
                        };
                        setAboutData({ ...aboutData, stats: newStats });
                      }}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="inline-flex items-center gap-2">
                <div className="h-0.5 w-6 bg-orange-600"></div>
                <span className="text-sm font-semibold tracking-wider text-orange-600">
                  {aboutData.subtitle}
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold leading-tight tracking-tight text-gray-900 lg:text-3xl">
                {aboutData.title}
              </h2>

              <div className="mt-6 space-y-4 text-base text-gray-600">
                {aboutData.description.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {aboutData.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}