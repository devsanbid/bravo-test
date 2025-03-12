"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, Volume2 } from "lucide-react";

interface SpeakingTestProps {
  isPracticeMode: boolean;
}

const SpeakingTest: React.FC<SpeakingTestProps> = ({ isPracticeMode }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Speaking Test</CardTitle>
        </CardHeader>
        <CardContent>
          {!isStarted ? (
            <div className="text-center space-y-4 py-8">
              <Mic className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-semibold">Speaking Test Instructions</h3>
              <p className="text-muted-foreground">
                Please ensure your microphone is working and you are in a quiet environment.
                {isPracticeMode && " You can practice and re-record your answers in practice mode."}
              </p>
              <Button onClick={() => setIsStarted(true)} size="lg">
                Start Test
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-4">
                  <h4 className="font-semibold mb-4">Part 1: Introduction and Interview</h4>
                  <p className="text-muted-foreground mb-4">
                    Describe a place you have visited that made a strong impression on you.
                    You should say:
                  </p>
                  <ul className="list-disc list-inside mb-4 text-muted-foreground">
                    <li>where it was</li>
                    <li>when you visited</li>
                    <li>what you did there</li>
                    <li>and explain why it made a strong impression on you</li>
                  </ul>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant={isRecording ? "destructive" : "default"}
                      onClick={toggleRecording}
                      className="w-40"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {recordedAudio && isPracticeMode && (
                <Card>
                  <CardContent className="py-4">
                    <h4 className="font-semibold mb-4">Your Recording</h4>
                    <div className="flex items-center gap-4">
                      <Button variant="outline">
                        <Play className="h-4 w-4 mr-2" />
                        Play Recording
                      </Button>
                      <Button variant="outline">
                        <Volume2 className="h-4 w-4 mr-2" />
                        View Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpeakingTest;
