"use server"
import { databases } from '@/lib/appwrite/config';
import { Query } from 'node-appwrite';

const TestComponent = async () => {

  try {
    const results = await databases.listDocuments(
      "67bd6d8d000a536a4c26", // Replace with your actual database ID
      "67c6ad26000b66f38442", // Replace with your actual collection ID
      [
            Query.limit(1)
        ]
    );
    console.log("Test Component Results:", results)
    return <div className='text-black'>{JSON.stringify(results)}</div>;

  } catch (error:any) {
    console.error("Test Component Error:", error);
    return <div>Error: {error.message}</div>
  }
};

export default TestComponent;
