"use server"
import { ID } from "@/lib/appwrite/config";
import { createAdminClient, createSessionClient } from "@/lib/server/appwrite";
import { Query } from "node-appwrite";
import {
	MockTest,
	Question,
	StudentAttempt,
	StudentResponse,
} from "@/lib/types/mock-test";

// Create a new mock test
export async function createMockTest(
	mockTest: Omit<MockTest, "id" | "createdAt" | "updatedAt">,
) {
	try {
		const { databases } = await createAdminClient();
		console.log("Mock Test ID = ", process.env.MOCKTEST_ID);
		const mockId = ID.unique();
		const newMockTest = await databases.createDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			mockId,
			{
				id: mockId,
				...mockTest,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		);

		return newMockTest;
	} catch (error) {
		console.error("Error creating mock test:", error);
		throw error;
	}
}

// Update an existing mock test
export async function updateMockTest(id: string, mockTest: Partial<MockTest>) {
	try {
		const { databases } = await createAdminClient();

		const updatedMockTest = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			id,
			{
				...mockTest,
				updatedAt: new Date().toISOString(),
			},
		);

		return updatedMockTest;
	} catch (error) {
		console.error("Error updating mock test:", error);
		throw error;
	}
}

// Delete a mock test
export async function deleteMockTest(id: string) {
	try {
		const { databases } = await createAdminClient();

		// First, delete all associated questions
		const questions = await getQuestionsByMockTestId(id);

		for (const question of questions) {
			await deleteQuestion(question.id);
		}

		// Then delete the mock test itself
		await databases.deleteDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			id,
		);

		return { success: true };
	} catch (error) {
		console.error("Error deleting mock test:", error);
		throw error;
	}
}

// Get all mock tests
export async function getAllMockTests() {
	try {
		const { databases } = await createSessionClient();
		console.log("Database ID:", process.env.NEXT_PUBLIC_DATABASEID);
		console.log("MockTest ID:", process.env.MOCKTEST_ID);

		const mockTests = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			[Query.limit(20)],
             
		);
		console.log("server mockTest =", mockTests);

		return mockTests.documents;
	} catch (error) {
		console.error("Error getting all mock tests:", error);
		throw error;
	}
}

// get single
export async function testGetSingleDocument(docId: string) {
	try {
		const { databases } = await createAdminClient();

		const document = await databases.getDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			docId,
		);

		console.log("Found document:", document);
		return document;
	} catch (error) {
		console.error("Error getting document:", error);
		throw error;
	}
}

// Get a single mock test by ID
export async function getMockTestById(id: string) {
	try {
		console.log("getMockTestById called with id:", id);
		console.log("Database ID:", process.env.NEXT_PUBLIC_DATABASEID);
		console.log("MockTest Collection ID:", process.env.MOCKTEST_ID);
		
		const { databases } = await createAdminClient();
		console.log("Admin client created successfully for getMockTestById");

		console.log("Fetching mock test with ID:", id);
		const mockTest = await databases.getDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			id,
		);
		
		console.log("Mock test data retrieved:", mockTest);
		return mockTest;
	} catch (error: any) {
		console.error("Error getting mock test by ID:", error);
		console.error("Error stack:", error.stack);
		throw error;
	}
}

// Get mock tests by category
export async function getMockTestsByCategory(category: string) {
	try {
		const { databases } = await createAdminClient();

		const mockTests = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			[Query.equal("category", category)], // Correct: uses Query object
		);

		return mockTests.documents;
	} catch (error) {
		console.error("Error getting mock tests by category:", error);
		throw error;
	}
}

// Get active mock tests
export async function getActiveMockTests() {
	try {
		const { databases } = await createAdminClient();

		const mockTests = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			[Query.equal("isActive", true)], // Correct: uses Query object
		);

		return mockTests.documents;
	} catch (error) {
		console.error("Error getting active mock tests:", error);
		throw error;
	}
}

// Get upcoming mock tests
export async function getUpcomingMockTests() {
	try {
		const { databases } = await createAdminClient();
		const now = new Date().toISOString();

		const mockTests = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.MOCKTEST_ID || "",
			[Query.greaterThan("scheduledDate", now), Query.equal("isActive", true)], // Correct: uses Query objects
		);

		return mockTests.documents;
	} catch (error) {
		console.error("Error getting upcoming mock tests:", error);
		throw error;
	}
}

// Create a new question for a mock test
export async function createQuestion(question: Omit<Question, "id">) {
    try {
        const { databases } = await createAdminClient();
        const questionId = ID.unique();
        console.log("question = ", question);

        // Get existing questions for the mock test to determine the order
        const existingQuestions = await getQuestionsByMockTestId(question.mockTestId);
        const maxOrder = existingQuestions.reduce((max, q) => Math.max(max, q.order || 0), 0);
        const newOrder = maxOrder + 1;

        const newQuestion = await databases.createDocument(
            process.env.NEXT_PUBLIC_DATABASEID || "",
            process.env.QUESTIONS_ID || "",
            questionId,
            { ...question, id: questionId, order: newOrder }, // Include order
        );

        return newQuestion;
    } catch (error) {
        console.error("Error creating question:", error);
        throw error;
    }
}

// Update an existing question
export async function updateQuestion(id: string, question: Partial<Question>) {
	try {
		const { databases } = await createAdminClient();

		const updatedQuestion = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.QUESTIONS_ID || "",
			id,
			question,
		);

		return updatedQuestion;
	} catch (error) {
		console.error("Error updating question:", error);
		throw error;
	}
}

// Delete a question
export async function deleteQuestion(id: string) {
	try {
		const { databases } = await createAdminClient();

		await databases.deleteDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.QUESTIONS_ID || "",
			id,
		);

		return { success: true };
	} catch (error) {
		console.error("Error deleting question:", error);
		throw error;
	}
}

// Get all questions for a mock test
export async function getQuestionsByMockTestId(mockTestId: string) {
	try {
		const { databases } = await createSessionClient();
		console.log("mockTestId = ", mockTestId);

		const questions = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.QUESTIONS_ID || "",
			[Query.equal("mockTestId", mockTestId), Query.limit(100)],
		);
        console.log("question of this id =", mockTestId, "and question are = ", questions)

		return questions.documents;
	} catch (error) {
		console.error("Error getting questions by mock test ID:", error);
		throw error;
	}
}

// Modified to handle fetching all questions in batches
export async function getAllQuestion() {
    try {
        const { databases } = await createAdminClient(); // Use admin client
        let allQuestions: any[] = [];
        let offset = 0;
        const limit = 100; // Fetch in batches of 100
        let hasMore = true;

        while (hasMore) {
            const questions = await databases.listDocuments(
                process.env.NEXT_PUBLIC_DATABASEID || "",
                process.env.QUESTIONS_ID || "",
                [Query.limit(limit), Query.offset(offset)],
            );

            allQuestions = allQuestions.concat(questions.documents);
            offset += limit;
            hasMore = questions.documents.length === limit;
        }

        console.log("questions = ", allQuestions);
        return allQuestions;
    } catch (error) {
        console.error("Error getting all questions:", error);
        throw error;
    }
}

// Data migration function to add 'order' to existing questions
export async function updateExistingQuestionsWithOrder() {
    try {
        const { databases } = await createAdminClient();
        const allQuestions = await getAllQuestion(); // Assuming this fetches all questions

        for (const question of allQuestions) {
            if (question.order === undefined) { // Only update if order is missing
                // Get existing questions for the mock test to determine the order
                const existingQuestions = await getQuestionsByMockTestId(question.mockTestId);
                const maxOrder = existingQuestions.reduce((max, q) => Math.max(max, q.order || 0), 0);
                const newOrder = maxOrder + 1;

                await databases.updateDocument(
                    process.env.NEXT_PUBLIC_DATABASEID || "",
                    process.env.QUESTIONS_ID || "",
                    question.$id,
                    { order: newOrder }
                );
                console.log(`Updated question ${question.$id} with order ${newOrder}`);
            }
        }
        return { success: true };

    } catch (error) {
        console.error("Error updating existing questions:", error);
        throw error;
    }
}

// Create a new student attempt
export async function createStudentAttempt(
	attempt: Omit<StudentAttempt, "id" | "startedAt" | "status">,
) {
	try {
		const { databases } = await createAdminClient();

		const studentId = ID.unique();

		const newAttempt = await databases.createDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTATTEMPTS_ID || "",
			studentId,
			{
				...attempt,
				id: studentId,
				startedAt: new Date().toISOString(),
				status: "in_progress",
			},
		);

		return newAttempt;
	} catch (error) {
		console.error("Error creating student attempt:", error);
		throw error;
	}
}

// Update a student attempt
export async function updateStudentAttempt(
	id: string,
	attempt: Partial<StudentAttempt>,
) {
	try {
		const { databases } = await createAdminClient();

		const updatedAttempt = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTATTEMPTS_ID || "",
			id,
			attempt,
		);

		return updatedAttempt;
	} catch (error) {
		console.error("Error updating student attempt:", error);
		throw error;
	}
}

// Complete a student attempt
export async function completeStudentAttempt(
	id: string,
	totalScore: number,
	percentageScore: number,
) {
	try {
		const { databases } = await createAdminClient();

		const completedAttempt = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTATTEMPTS_ID || "",
			id,
			{
				completedAt: new Date().toISOString(),
				status: "completed",
				totalScore,
				percentageScore: Math.round(percentageScore), // Convert to integer
			},
		);

		return completedAttempt;
	} catch (error) {
		console.error("Error completing student attempt:", error);
		throw error;
	}
}

// Get student attempts by user ID
export async function getStudentAttemptsByUserId(userId: string) {
	try {
		console.log("getStudentAttemptsByUserId called with userId:", userId);
		console.log("Database ID:", process.env.NEXT_PUBLIC_DATABASEID);
		console.log("Student Attempts Collection ID:", process.env.STUDENTATTEMPTS_ID);
		
		const { databases } = await createAdminClient();
		console.log("Admin client created successfully");

		console.log("Querying for attempts with userId:", userId);
		const attempts = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTATTEMPTS_ID || "",
			[Query.equal("userId", userId)],
		);
		
		console.log("Query completed, total documents found:", attempts.total);
		console.log("Attempts data:", attempts);
		console.log("Attempts documents:", attempts.documents);

		return attempts.documents;
	} catch (error: any) {
		console.error("Error getting student attempts by user ID:", error);
		console.error("Error message:", error.message);
		console.error("Error stack:", error.stack);
		throw error;
	}
}

// Get student attempt by ID
export async function getStudentAttemptById(id: string) {
	try {
		const { databases } = await createAdminClient();

		const attempt = await databases.getDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTATTEMPTS_ID || "",
			id,
		);

		return attempt;
	} catch (error) {
		console.error("Error getting student attempt by ID:", error);
		throw error;
	}
}

// Create a student response
export async function createStudentResponse(
	response: Omit<StudentResponse, "id">,
) {
	try {
		const { databases } = await createAdminClient();
		const responseId = ID.unique();

		const newResponse = await databases.createDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTRESPONSES_ID || "",
			responseId,
			{ ...response, id: responseId },
		);

		return newResponse;
	} catch (error) {
		console.error("Error creating student response:", error);
		throw error;
	}
}

// Update a student response
export async function updateStudentResponse(
	attemptId: string,
	response: Partial<StudentResponse>,
) {
	try {
		const { databases } = await createAdminClient();
		
		// Check if questionId is defined
		if (!response.questionId) {
			throw new Error("questionId is required for updating a student response");
		}

		// First, find the existing response by attemptId and questionId
		const existingResponses = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTRESPONSES_ID || "",
			[
				Query.equal("attemptId", attemptId),
				Query.equal("questionId", response.questionId)
			]
		);
		
		// If no existing response is found, create a new one instead of throwing an error
		if (existingResponses.documents.length === 0) {
			console.log("No existing response found, creating a new one");
			const responseId = ID.unique();
			
			// Create a new response document
			const newResponse = await databases.createDocument(
				process.env.NEXT_PUBLIC_DATABASEID || "",
				process.env.STUDENTRESPONSES_ID || "",
				responseId,
				{ 
					...response, 
					id: responseId,
					attemptId: attemptId
				}
			);
			
			return newResponse;
		}
		
		// Get the document ID of the existing response
		const responseId = existingResponses.documents[0].$id;
		
		try {
			// Update the response using the correct document ID
			const updatedResponse = await databases.updateDocument(
				process.env.NEXT_PUBLIC_DATABASEID || "",
				process.env.STUDENTRESPONSES_ID || "",
				responseId,
				response,
			);
			
			return updatedResponse;
		} catch (updateError) {
			console.error("Error during document update:", updateError);
			
			// If update fails, try to get the document to see if it exists
			try {
				const document = await databases.getDocument(
					process.env.NEXT_PUBLIC_DATABASEID || "",
					process.env.STUDENTRESPONSES_ID || "",
					responseId
				);
				
				// If we can get the document but couldn't update it, return it as is
				console.log("Document exists but couldn't be updated:", document);
				return document;
			} catch (getError) {
				console.error("Error getting document:", getError);
				throw updateError; // Throw the original error
			}
		}
	} catch (error) {
		console.error("Error updating student response:", error);
		throw error;
	}
}

// Get student responses by attempt ID
export async function getStudentResponsesByAttemptId(attemptId: string) {
	try {
		const { databases } = await createAdminClient();

		const responses = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTRESPONSES_ID || "",
			[Query.equal("attemptId", attemptId)],
		);

		return responses.documents;
	} catch (error) {
		console.error("Error getting student responses by attempt ID:", error);
		throw error;
	}
}

// Grade a student response (for manual grading by moderators)
export async function gradeStudentResponse(
	id: string,
	score: number,
	feedback: string,
) {
	try {
		const { databases } = await createAdminClient();

		const gradedResponse = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.STUDENTRESPONSES_ID || "",
			id,
			{
				score,
				feedback,
				gradedAt: new Date().toISOString(),
				gradedBy: "manual", // Indicates manual grading
			},
		);

		return gradedResponse;
	} catch (error) {
		console.error("Error grading student response:", error);
		throw error;
	}
}

// Create a notification for a user
export async function createNotification(
	userId: string,
	mockTestId: string,
	message: string,
	type: string,
) {
	try {
		const { databases } = await createAdminClient();
		const nofictaionId = ID.unique();

		const newNotification = await databases.createDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.NOTIFICATIONS_ID || "",
			nofictaionId,
			{
				userId,
				id: nofictaionId,
				mockTestId,
				message,
				type,
				createdAt: new Date().toISOString(),
				read: false,
			},
		);

		return newNotification;
	} catch (error) {
		console.error("Error creating notification:", error);
		throw error;
	}
}

// Get unread notifications for a user
export async function getUnreadNotificationsByUserId(userId: string) {
	try {
		const { databases } = await createAdminClient();

		const notifications = await databases.listDocuments(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.NOTIFICATIONS_ID || "",
			[Query.equal("userId", userId), Query.equal("read", false)],
		);

		return notifications.documents;
	} catch (error) {
		console.error("Error getting unread notifications by user ID:", error);
		throw error;
	}
}

// Mark a notification as read
export async function markNotificationAsRead(id: string) {
	try {
		const { databases } = await createAdminClient();

		const updatedNotification = await databases.updateDocument(
			process.env.NEXT_PUBLIC_DATABASEID || "",
			process.env.NOTIFICATIONS_ID || "",
			id,
			{
				read: true,
			},
		);

		return updatedNotification;
	} catch (error) {
		console.error("Error marking notification as read:", error);
		throw error;
	}
}
