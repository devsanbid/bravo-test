import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bravo Consultancy - IELTS, PTE, GRE, SAT Preparation",
    description: "Expert coaching for IELTS, PTE, GRE, and SAT exams. Join Bravo Consultancy for personalized guidance and achieve your target scores.",
    keywords: ["IELTS preparation", "PTE coaching", "GRE training", "SAT preparation", "English proficiency", "Study abroad", "Test preparation", "Language exams"],
    authors: [{ name: "Bravo Consultancy" }],

    openGraph: {
      title: "Bravo Consultancy - IELTS, PTE, GRE, SAT Preparation",
      description: "Expert coaching for IELTS, PTE, GRE, and SAT exams. Join Bravo Consultancy for personalized guidance and achieve your target scores.",
      type: "website",
    }
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<AuthProvider>
					{children}
				</AuthProvider>
				<Toaster position="top-center" expand={true} richColors />
			</body>
		</html>
	);
}
