"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ShareImage } from "@/components/ui/ShareImage";
import { FullScreenImage } from "@/components/ui/FullScreenImage";

interface ImageCardProps {
	imageId: string;
	title: string;
	description: string;
	imageUrl: string;
    onUpdate?: (imageId: string) => void;
    onDelete?: (imageId: string) => void;
	isMod?: boolean;
    imageUrls: string[];
}

export function ImageCard({
	imageId,
	title,
	description,
	imageUrl,
	onUpdate,
	onDelete,
	isMod = false,
    imageUrls
}: ImageCardProps) {
	const [isHovered, setIsHovered] = useState(false);
    const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
	const router = useRouter();

    const downloadImage = (url: string, name: string) => {
        fetch(url)
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    }

	return (
		<>
        <div
			className="relative group shadow-md rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-lg"
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsFullScreenOpen(true)}
		>
			<Image
				src={imageUrl}
				alt={title}
				width={500}
				height={300}
				className="w-full h-auto object-cover cursor-pointer"
			/>
			{isHovered && (
				<div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300">
					<div className="text-center p-4">
						<h2 className="text-white text-xl font-semibold">{title}</h2>
						<p className="text-gray-300 text-sm mt-2">{description}</p>
						<div className="mt-4 flex gap-2 justify-center">
							{isMod ? (
								<>
									<Button
										variant="secondary"
										className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
										onClick={(e) => {
											e.stopPropagation();
											if (onUpdate) {
												onUpdate(imageId);
											}
										}}
									>
										Update
									</Button>
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="destructive" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Are you sure?</DialogTitle>
												<DialogDescription>
													This action cannot be undone.
												</DialogDescription>
											</DialogHeader>
											{/* Confirm and Cancel buttons */}
											<div className="flex justify-end gap-2 pt-4">
												<Button
													variant="outline"
													className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
													onClick={(e) => {
														e.stopPropagation();
														// Close the dialog
													}}
												>
													Cancel
												</Button>
												<Button
													variant="destructive"
													className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
													onClick={(e) => {
														e.stopPropagation();
														if (onDelete) {
															onDelete(imageId);
														}
													}}
												>
													Confirm
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								</>
							) : (
								<>
									<Button variant="secondary" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => downloadImage(imageUrl, title)}>Download</Button>
									<Dialog>
										<DialogTrigger asChild>
											<Button variant="secondary" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">Share</Button>
										</DialogTrigger>
										<DialogContent>
                                            <DialogTitle>Share Image</DialogTitle>
											<ShareImage imageUrl={imageUrl} title={title} />
										</DialogContent>
									</Dialog>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
        <Dialog open={isFullScreenOpen} onOpenChange={setIsFullScreenOpen}>
            <DialogContent className="max-w-none">
                <FullScreenImage
                    imageUrl={imageUrl}
                    title={title}
                    description={description}
                    imageUrls={imageUrls}
                    onClose={() => setIsFullScreenOpen(false)}
                />
            </DialogContent>
        </Dialog>
        </>
	);
}
