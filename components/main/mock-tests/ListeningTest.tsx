"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Headphones } from "lucide-react";
interface ListeningTestProps {
  isPracticeMode: boolean;
}

const ListeningTest: React.FC<ListeningTestProps> = ({ isPracticeMode }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [volume, setVolume] = useState(100);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Listening Test</CardTitle>
        </CardHeader>
        <CardContent>
          {!isStarted ? (
            <div className="text-center space-y-4 py-8">
              <Headphones className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Prepare for your Listening Test</h3>
              <p className="text-muted-foreground">
                Please ensure you're wearing headphones and are in a quiet environment.
                {isPracticeMode && " You can adjust the volume and replay audio in practice mode."}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline" onClick={() => setVolume(Math.min(volume + 10, 100))}>
                  <Volume2 className="h-4 w-4" />
                </Button>
                <span className="min-w-[60px]">{volume}%</span>
                <Button variant="outline" onClick={() => setVolume(Math.max(volume - 10, 0))}>
                  <VolumeX className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={() => setIsStarted(true)} size="lg" className="mt-4">
                Start Test
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Part 1: Conversation
                </div>
                <div className="flex items-center gap-2">
                  {isPracticeMode && (
                    <Button variant="outline" size="sm">
                      View Transcript
                    </Button>
                  )}
                </div>
              </div>
              
              <Card>
                <CardContent className="py-4">
                  <div className="space-y-4">
                    <div className="font-medium">Question 1 of 40</div>
                    <audio controls className="w-full">
                      <source src="/sample-audio.mp3" type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <Button
                          key={option}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {option}. Option {option}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListeningTest;
