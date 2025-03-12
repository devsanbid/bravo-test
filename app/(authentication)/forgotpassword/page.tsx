import Footer from "@/components/main/Footer";
import ForgotPasswordForm from "@/components/main/ForgotPasswordFrame";
import Navbar from "@/components/main/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Forgot Password - Bravo Consultancy',
    description: 'Reset your password for your Bravo Consultancy account to regain access to your IELTS, PTE, GRE, and SAT preparation resources.',
    keywords: ['forgot password', 'reset password', 'account recovery', 'IELTS', 'PTE', 'GRE', 'SAT']
};

export default function ForgotPassword() {
	return (
		<div>
			<Navbar />
			<ForgotPasswordForm />
			<Footer />
		</div>
	);
}
