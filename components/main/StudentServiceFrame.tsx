"use client";

import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ClipboardCheck, BookOpen, FormInput } from "lucide-react";

const services = [
  {
    icon: GraduationCap,
    title: "Study Abroad",
    description:
      "Study Abroad - Start your journey with Alfa Beta. As the leading overseas education consultancy in Nepal, we guide you to...",
  },
  {
    icon: ClipboardCheck,
    title: "Mock Test",
    description:
      "Elevate Your Test Preparation Journey with Alfa Beta's Comprehensive Program. Are you gearing up for the IELTS, TOEFL, SAT, or PTE exams?",
  },
  {
    icon: BookOpen,
    title: "Test Preparation",
    description:
      "Alfa Beta's Test Preparation Excellence: A Gateway to Success. Unlock your full potential with our meticulously designed courses.",
  },
  {
    icon: FormInput,
    title: "Test Registration",
    description:
      "Unlock your academic future with Alfa Beta's Test Registration services, tailored to streamline your journey toward success.",
  },
];

export default function StudentServicesFrame() {
  return (
    <section className="bg-gradient-to-b from-white to-orange-50/50 py-10 border-b">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative inline-block"
          >
            <h2 className="relative z-10 text-2xl font-bold text-orange-500 sm:text-3xl">
              Student Services
            </h2>
            <div className="absolute -bottom-2 left-0 h-0.5 w-full bg-blue-500"></div>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Wide Range of Services
          </motion.h3>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
            >
              <div className="group relative h-full rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10">
                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                  <service.icon className="h-6 w-6" />
                </div>

                {/* Title */}
                <h3 className="mb-3 text-xl font-bold text-gray-900">{service.title}</h3>

                {/* Description */}
                <p className="mb-4 text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Learn More Link */}
                <div className="mt-4">
                  <a
                    href="#"
                    className="inline-flex items-center text-blue-500 transition-colors hover:text-blue-700"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}