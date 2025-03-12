import Footer from "@/components/main/Footer";
import Navbar from "@/components/main/Navbar";
import RegisterForm from "@/components/main/RegisterFrame";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Register - Bravo Consultancy',
    description: 'Create an account with Bravo Consultancy to access personalized IELTS, PTE, GRE, and SAT preparation resources and track your progress.',
    keywords: ['register', 'sign up', 'create account', 'IELTS preparation', 'PTE coaching', 'GRE training', 'SAT preparation']
};

export default function Register() {
	return (
		<div>
            <Navbar />
			<RegisterForm />
            <Footer />
		</div>
	);
}
