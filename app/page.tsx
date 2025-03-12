import Footer from "@/components/main/Footer";
import HeadLine from "@/components/main/HeadLine";
import Navbar from "@/components/main/Navbar";
import StudentServiceFrame from "@/components/main/StudentServiceFrame";
import AboutSectionFrame from "@/components/main/AboutSectionFrame";
import ContactSectionFrame from "@/components/main/ContactSectionFrame";
import RecentBlogSection from "@/components/main/RecentBlogSection";
import Testimonial from "@/components/main/Testimonial";
import type { Metadata } from "next";
import "react-quill/dist/quill.snow.css";

export const metadata: Metadata = {
    title: 'Bravo Consultancy - Expert IELTS, PTE, GRE, SAT Preparation',
    description: 'Achieve your target scores with expert coaching for IELTS, PTE, GRE, and SAT exams. Personalized guidance, comprehensive study materials, and proven strategies.',
    keywords: ['IELTS preparation', 'PTE coaching', 'GRE training', 'SAT preparation', 'English proficiency', 'Study abroad', 'Test preparation', 'Language exams'],
    authors: [{ name: 'Bravo Consultancy' }],

    openGraph: {
      title: 'Bravo Consultancy - Expert IELTS, PTE, GRE, SAT Preparation',
      description: 'Achieve your target scores with expert coaching for IELTS, PTE, GRE, and SAT exams. Personalized guidance, comprehensive study materials, and proven strategies.',
      type: 'website',
    }
};

export default function Home() {
	return (
		<div>
			<Navbar />
			<HeadLine />
			<StudentServiceFrame />
			<AboutSectionFrame />
			<Testimonial />
			<RecentBlogSection />
			<ContactSectionFrame />
			<Footer />
		</div>
	);
}
