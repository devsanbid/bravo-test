 'use client';
 import { useState, useEffect } from 'react';
 import { getImageById, updateImage } from '@/controllers/GalleryController';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { useRouter, useParams } from 'next/navigation';

 export default function UpdateImagePage() {
   const [file, setFile] = useState<File | null>(null);
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const router = useRouter();
   const params = useParams();
   const imageId = params.id as string;

   useEffect(() => {
     async function fetchImage() {
       try {
         const image = await getImageById(imageId);
         setTitle(image.title);
         setDescription(image.description);
       } catch (error) {
         console.error('Error fetching image:', error);
       }
     }
     fetchImage();
   }, [imageId]);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateImage(imageId, {
        title,
        description,
        file: file ?? undefined,
      });
      router.push("/mod/gallery");
    } catch (error) {
      console.error("Error updating image:", error);
    }
  };

   return (
     <div className="p-4">
       <h1 className="text-2xl font-bold mb-4">Update Image</h1>
       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <Label htmlFor="title">Title</Label>
           <Input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
         </div>
         <div>
           <Label htmlFor="description">Description</Label>
           <textarea
             id="description"
             value={description}
             onChange={(e) => setDescription(e.target.value)}
             className="w-full p-2 border rounded"
             required
           />
         </div>
         <div>
           <Label htmlFor="file">New Image File (Optional)</Label>
           <Input type="file" id="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
         </div>
         <Button type="submit">Update</Button>
       </form>
     </div>
   );
 }
