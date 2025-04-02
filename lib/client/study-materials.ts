// Client-side utility functions for study materials

export interface StudyMaterial {
  $id: string;
  title: string;
  description: string;
  category: string;
  fileId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  userId: string;
}

// Fetch all study materials with optional filtering
export async function fetchStudyMaterials(limit = 100, offset = 0, category?: string): Promise<StudyMaterial[]> {
  try {
    let url = `/api/study-materials?limit=${limit}&offset=${offset}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch study materials');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching study materials:", error);
    throw error;
  }
}

// Fetch a single study material by ID (for update purposes)
export async function fetchStudyMaterial(id: string): Promise<StudyMaterial> {
  try {
    const response = await fetch(`/api/study-materials/update?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch study material');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching study material:", error);
    throw error;
  }
}

// Fetch a single study material by ID (for viewing details)
export async function fetchStudyMaterialById(id: string): Promise<StudyMaterial> {
  try {
    const response = await fetch(`/api/study-materials/detail?id=${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch study material details');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching study material details:", error);
    throw error;
  }
}

// Create a new study material
export async function createStudyMaterial(formData: FormData): Promise<StudyMaterial> {
  try {
    const response = await fetch('/api/study-materials/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create study material');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating study material:", error);
    throw error;
  }
}

// Update an existing study material
export async function updateStudyMaterial(id: string, formData: FormData): Promise<StudyMaterial> {
  try {
    const response = await fetch(`/api/study-materials/update?id=${id}`, {
      method: 'PATCH',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to update study material');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating study material:", error);
    throw error;
  }
}

// Delete a study material
export async function deleteStudyMaterial(id: string, fileId: string): Promise<void> {
  try {
    const response = await fetch(`/api/study-materials?id=${id}&fileId=${fileId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete study material');
    }
  } catch (error) {
    console.error("Error deleting study material:", error);
    throw error;
  }
}

// Get predefined categories for study materials
export function getStudyMaterialCategories(): string[] {
  return [
    "IELTS",
    "PTE",
    "GRE",
    "SAT",
    "TOEFL",
    "General English",
    "Grammar",
    "Vocabulary",
    "Reading",
    "Writing",
    "Speaking",
    "Listening",
    "Other"
  ];
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Get file icon based on type
export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📽️';
  return '📁';
}
