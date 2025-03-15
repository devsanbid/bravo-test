export interface UserDataInterface {
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: string; // Or Date if you parse it
  phone: string;
  service: string;
  role: string;
  type: string;
  $id: string;
  $createdAt: string; // Or Date if you parse it
  $updatedAt: string; // Or Date if you parse it
  $permissions: string[];
  $databaseId: string;
  $collectionId: string;
}
