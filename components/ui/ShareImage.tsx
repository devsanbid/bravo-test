"use client";
import Image from "next/image";
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
import { toast } from "sonner";

interface ShareImageProps {
  imageUrl: string;
  title: string;
}

export function ShareImage({ imageUrl, title }: ShareImageProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(imageUrl);
    setIsCopied(true);
    toast.success("Image link copied to clipboard!");
  };

  const shareMessage = `Check out this amazing achievement by our student ${title}! Learn more about our IETS, PTE, GRE, and SAT programs at [Your Website URL] #IETS #PTE #GRE #SAT #StudentAchievement`;

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(shareMessage)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareMessage)}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/shareArticle?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(shareMessage)}`;
  const telegramShareUrl = `https://telegram.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <input
          type="text"
          value={imageUrl}
          className="flex-1 rounded-md border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 read-only:cursor-not-allowed"
          readOnly
        />
        <Button
          variant="secondary"
          className="ml-2"
          onClick={copyToClipboard}
          disabled={isCopied}
        >
          {isCopied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="flex justify-around">
        <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer">
          <Image src="/facebook.svg" alt="Facebook" width={32} height={32}  style={{width: '32px', height: '32px'}} />
        </a>
        <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer">
          <Image src="/twitter.svg" alt="Twitter" width={32} height={32} style={{width: '32px', height: '32px'}} />
        </a>
        <a href={linkedinShareUrl} target="_blank" rel="noopener noreferrer">
          <Image src="/linkedin.svg" alt="LinkedIn" width={32} height={32} style={{width: '32px', height: '32px'}} />
        </a>
        <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer">
          <Image src="/telegram.svg" alt="Telegram" width={32} height={32} style={{width: '32px', height: '32px'}} />
        </a>
      </div>
    </div>
  );
}
