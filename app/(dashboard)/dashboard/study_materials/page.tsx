"use client"
import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  BookmarkPlus,
  NotepadText,
  ListCheck
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const StudyMaterials = () => {
  return (
    <div className="space-y-6 p-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <Button variant="outline" className="gap-2">
          <BookmarkPlus className="h-4 w-4" />
          Save for Later
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Course Materials</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Access comprehensive study guides, practice exercises, and course materials.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Video Lessons</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Watch recorded lectures and tutorial videos for better understanding.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <NotepadText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Practice Worksheets</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Download and complete practice worksheets for various topics.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ListCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Progress Tracking</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Monitor your learning progress and identify areas for improvement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ielts" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="ielts">IELTS</TabsTrigger>
          <TabsTrigger value="pte">PTE</TabsTrigger>
          <TabsTrigger value="gre">GRE</TabsTrigger>
          <TabsTrigger value="sat">SAT</TabsTrigger>
          <TabsTrigger value="toefl">TOEFL</TabsTrigger>
        </TabsList>

        <TabsContent value="ielts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Reading Materials</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Academic Reading Practice Tests</li>
                  <li>• Reading Comprehension Strategies</li>
                  <li>• Vocabulary Building Exercises</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Writing Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Essay Writing Templates</li>
                  <li>• Task 1 & 2 Practice Materials</li>
                  <li>• Sample Answer Essays</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Speaking Practice</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Speaking Test Sample Questions</li>
                  <li>• Pronunciation Guides</li>
                  <li>• Common Topics & Answers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pte" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Similar structure as IELTS but with PTE-specific content */}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Search</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Study Materials</Label>
            <Input 
              id="search" 
              placeholder="Enter keywords to find specific materials..."
              className="mt-2"
            />
          </div>
          <Button className="mt-8">Search</Button>
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
