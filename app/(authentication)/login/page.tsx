import Footer from "@/components/main/Footer";
import LoginForm from "@/components/main/LoginFrame";
import Navbar from "@/components/main/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Login - Bravo Consultancy',
    description: 'Sign in to your Bravo Consultancy account to access personalized IELTS, PTE, GRE, and SAT preparation resources.',
    keywords: ['login', 'sign in', 'account access', 'IELTS', 'PTE', 'GRE', 'SAT']
};

export default function Login() {
	return (
		<div>
            <Navbar />
			<LoginForm />
            <Footer />
		</div>
	);
}
