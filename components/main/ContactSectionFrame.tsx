"use client";

import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function ContactSectionFrame() {
	return (
		<section className="relative overflow-hidden bg-[#C47D5E] py-20">
			<div className="container mx-auto px-4">
				<div className="grid items-center gap-8 lg:grid-cols-2">
					{/* Left Column - Image and Thought Bubble */}
					<div className="relative">
						{/* Animated dots */}

						<Image
							src="/others/contact.png"
							alt="Professional with laptop"
							className="relative border z-10 mx-auto max-w-md"
							width={200}
							height={200}
						/>
					</div>

					{/* Right Column - Contact Info */}
					<div className="text-center lg:text-left">
						{/* Phone Icon with Ring Animation */}
						<motion.div
							className="mx-auto mb-6 inline-block lg:mx-0"
							animate={{
								rotate: [-10, 10, -10],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 0.5,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
						>
							<div className="relative">
								<div className="rounded-full bg-white p-4">
									<Phone className="h-8 w-8 text-[#C47D5E]" />
								</div>
								{/* Ring Effect */}
								<motion.div
									className="absolute -inset-1 rounded-full border-2 border-white"
									animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
									transition={{
										duration: 1.5,
										repeat: Number.POSITIVE_INFINITY,
									}}
								></motion.div>
							</div>
						</motion.div>

						<h2 className="mb-2 text-2xl font-bold text-white">CALL US 24/7</h2>
						<a
							href="tel:+97798012562930"
							className="mb-4 block text-3xl font-bold text-white hover:opacity-90"
						>
							(+977) 9801256293
						</a>
						<p className="mb-8 text-lg text-white/90">
							Have any idea or project for in your mind call us or schedule a
							appointment. Our representative will reply you shortly.
						</p>

						<Button className="bg-white px-8 py-6 text-lg font-semibold text-[#C47D5E] hover:bg-white/90">
							Let&apos;s Talk
						</Button>
					</div>
				</div>

				{/* Stats Section */}
				<motion.div
					initial={{ y: 50, opacity: 0 }}
					whileInView={{ y: 0, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="mt-16 rounded-2xl bg-white p-8"
				>
					<div className="grid gap-8 text-center sm:grid-cols-3">
						{[
							{ number: "15k", label: "Happy Clients" },
							{ number: "30+", label: "Companies" },
							{ number: "30+", label: "Projects Done" },
						].map((stat, index) => (
							<motion.div
								key={stat.label}
								initial={{ scale: 0.5, opacity: 0 }}
								whileInView={{ scale: 1, opacity: 1 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
								className="space-y-2"
							>
								<h3 className="text-4xl font-bold text-[#8B4513]">
									{stat.number}
								</h3>
								<p className="text-lg text-gray-600">{stat.label}</p>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
