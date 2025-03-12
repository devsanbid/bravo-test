"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface WritingTestProps {
	isPracticeMode: boolean;
}

const WritingTest: React.FC<WritingTestProps> = ({ isPracticeMode }) => {
	const [isStarted, setIsStarted] = useState(false);
	const [wordCount, setWordCount] = useState(0);

	const countWords = (text: string) => {
		const words = text.trim().split(/\s+/);
		return text.trim() === "" ? 0 : words.length;
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex justify-between items-center">
						<span>Writing Test</span>
						{isStarted && (
							<div className="flex items-center gap-4">
								<span
									className={`${wordCount < 250 ? "text-red-500" : "text-green-500"}`}
								>
									{wordCount}/250 words
								</span>
								<Button variant="outline" size="sm">
									<Save className="h-4 w-4 mr-2" />
									Save Draft
								</Button>
							</div>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					{!isStarted ? (
						<div className="text-center space-y-4 py-8">
							<h3 className="text-xl font-semibold">
								Writing Test Instructions
							</h3>
							<p className="text-muted-foreground">
								You will have 60 minutes to complete two tasks:
								<br />
								Task 1 (20 minutes): 150 words minimum
								<br />
								Task 2 (40 minutes): 250 words minimum
							</p>
							<Button onClick={() => setIsStarted(true)} size="lg">
								Start Test
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="prose max-w-none">
								<h4>Task 2: Essay (40 minutes)</h4>
								<p className="text-muted-foreground">
									Some people believe that unpaid community service should be a
									compulsory part of high school programmes. To what extent do
									you agree or disagree?
								</p>
							</div>
							<textarea
								className="w-full h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
								placeholder="Write your essay here..."
								onChange={(e) => setWordCount(countWords(e.target.value))}
							/>
							{isPracticeMode && (
								<div className="flex justify-between items-center text-sm text-muted-foreground">
									<span>Spell check enabled in practice mode</span>
									<Button variant="outline" size="sm">
										View Sample Answer
									</Button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default WritingTest;
