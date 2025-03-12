"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Save } from "lucide-react";

// Initial contact data
const initialContactInfo = {
  phone: "+977 - 9851352807 / 015908733",
  email: "info@bravointernational.edu.np",
  address: "Putalisadak Chowk Kathmandu",
  openingHours: "9AM-18PM",
  socialMedia: {
    facebook: "https://facebook.com/bravointernational",
    linkedin: "https://linkedin.com/company/bravointernational",
    youtube: "https://youtube.com/bravointernational",
    instagram: "https://instagram.com/bravointernational",
  },
  mapLocation: {
    latitude: "27.7047",
    longitude: "85.3206",
  },
};

export default function ContactManagement() {
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log("Saving contact info:", contactInfo);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contact Information Management</h1>
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="gap-2"
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" /> Save Changes
            </>
          ) : (
            "Edit Information"
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Numbers
              </Label>
              <Input
                value={contactInfo.phone}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </Label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </Label>
              <Textarea
                value={contactInfo.address}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, address: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Opening Hours
              </Label>
              <Input
                value={contactInfo.openingHours}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, openingHours: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(contactInfo.socialMedia).map(([platform, url]) => (
              <div key={platform} className="space-y-2">
                <Label className="capitalize">{platform}</Label>
                <Input
                  value={url}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      socialMedia: {
                        ...contactInfo.socialMedia,
                        [platform]: e.target.value,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Map Location */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Map Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  value={contactInfo.mapLocation.latitude}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      mapLocation: {
                        ...contactInfo.mapLocation,
                        latitude: e.target.value,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  value={contactInfo.mapLocation.longitude}
                  onChange={(e) =>
                    setContactInfo({
                      ...contactInfo,
                      mapLocation: {
                        ...contactInfo.mapLocation,
                        longitude: e.target.value,
                      },
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="mt-4 aspect-video rounded-lg border bg-muted">
              {/* Map preview would go here - using a placeholder for now */}
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                Map Preview
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}