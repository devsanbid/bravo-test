"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Search } from "lucide-react";

interface ReadingTestProps {
  isPracticeMode: boolean;
}

const ReadingTest: React.FC<ReadingTestProps> = ({ isPracticeMode }) => {
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isStarted, setIsStarted] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Reading Test</span>
            {isStarted && (
              <div className="flex items-center gap-2 text-orange-500">
                <Clock className="h-5 w-5" />
                {formatTime(timeLeft)}
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isStarted ? (
            <div className="text-center space-y-4 py-8">
              <h3 className="text-xl font-semibold">Ready to start your Reading Test?</h3>
              <p className="text-muted-foreground">
                You will have 60 minutes to complete 40 questions.
                {isPracticeMode && " Practice mode includes additional tools and feedback."}
              </p>
              <Button onClick={() => setIsStarted(true)} size="lg">
                Start Test
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 h-[600px] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Passage 1</h4>
                  {isPracticeMode && (
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Dictionary
                    </Button>
                  )}
                </div>
                <div className="prose max-w-none">
                  {/* Sample passage content */}
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                    eiusmod tempor incididunt ut labore et dolore magna aliqua...
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="py-4">
                    <div className="space-y-4">
                      <div className="font-medium">Question 1 of 40</div>
                      <p>What is the main idea of the first paragraph?</p>
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
                <div className="flex justify-between">
                  <Button variant="outline" disabled>Previous</Button>
                  <Button>Next Question</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReadingTest;
