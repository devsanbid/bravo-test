"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { uploadImage } from "@/controllers/GalleryController";
import {
	client_databases,
	client_storage,
	ID,
} from "@/lib/appwrite/client-config";

// Zod schema validation
const formSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
	file: z
		.instanceof(File)
		.refine((file) => file.size > 0, "Please select a file"),
});

export default function GalleryCreate() {
	const { user, checkUser } = useAuthStore();
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		async function fetchUser() {
			await checkUser();
		}
		fetchUser();
	}, []);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: "",
			description: "",
			file: undefined, // Initialize as undefined since no file is selected initially
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.file) {
      toast.error("Please select an image to upload.");
      return;
    }

    try {
      setIsLoading(true);
      const imageUpload = await client_storage.createFile(
        process.env.NEXT_PUBLIC_BUCKETID as string,
        ID.unique(),
        values.file,
        {
          'Cache-Control': 'no-cache',
        }
      );

      // Create document with image reference
      await client_databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASEID as string,
        process.env.NEXT_PUBLIC_GALLERY_ID as string,
        ID.unique(),
        {
          title: values.title,
          description: values.description,
          imageId: imageUpload.$id,
          createdAt: new Date().toISOString(),
          userId: "sanbid",
        }
      );
      toast.success("Image uploaded successfully!");
      router.push("/mod/gallery");
    } catch (error) {
      toast.error("Failed to upload image.");
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  }

	return (
		<div className="min-h-screen bg-gradient-to-b from-brand-purple/5 to-brand-orange/5 py-6 sm:py-8 md:py-12 px-4 sm:px-6">
			<div className="max-w-[1200px] mx-auto">
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-brand-purple/10">
					<div className="lg:grid lg:grid-cols-2">
						<div className="p-6 lg:p-8 flex flex-col justify-between">
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
								Create a New Gallery Image
							</h1>
							<p className="text-brand-purple/80 max-w-sm">
								Upload an image and its details to be displayed in the gallery.
							</p>
						</div>

						<div className="p-6 lg:p-8 flex items-center justify-center">
							<div className="w-full max-w-md space-y-8">
								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-5"
									>
										<FormField
											control={form.control}
											name="title"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-brand-purple">
														Image Title
													</FormLabel>
													<FormControl>
														<Input
															{...field}
															className="h-12"
															placeholder="Image Title"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="description"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-brand-purple">
														Image Description
													</FormLabel>
													<FormControl>
														<Textarea
															{...field}
															className="h-24"
															placeholder="Describe the image in detail"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="file"
											render={({ field: { ref, name, onBlur } }) => (
												<FormItem>
													<FormLabel className="text-brand-purple">
														Select Image
													</FormLabel>
													<FormControl>
														<Input
															type="file"
															ref={ref}
															name={name}
															onBlur={onBlur}
															onChange={(e) => {
																const file = e.target.files?.[0];
																form.setValue("file", file); // Manually set the file value
															}}
															className="h-12"
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<Button
											type="submit"
											size="lg"
											className="w-full text-lg bg-brand-orange hover:bg-brand-orange/90 text-white h-12 mt-6"
											disabled={isLoading}
										>
											{isLoading ? "Uploading..." : "Upload Image"}
										</Button>
									</form>
								</Form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
