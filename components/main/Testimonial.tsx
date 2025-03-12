"use client"

import { useEffect, useState, useCallback } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Smarika Chauhan",
    institution: "Texas A&M University Texarkana (USA)",
    rating: 5,
    text: "My counselor was beneficial during my visa process. He promptly answered all my queries as a student applying for a visa during the pandemic. I was nervous but Sir's positive attitude can instantly put one at ease.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Aarju Karki",
    institution: "Southern Illinois University Edwardsville",
    rating: 4,
    text: "Thank you for providing me with such a great opportunity to study abroad. I would like to thank the team of Alfa Beta who was helpful and guided throughout the process. Your service has been amazing so far.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    name: "Aashish Poudel",
    institution: "Hayes Valdez",
    rating: 5,
    text: "I would like to thank Alfa Beta Institute and especially Miss. Kritisha Karki for the successful completion of my visa grant process. It was very difficult for me to get an Australian student visa without the cooperation and help of the Alfa Beta family. I am very thankful to the Alfa Beta family.",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  const prevSlide = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setTimeout(() => setIsAnimating(false), 500)
  }, [isAnimating])

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [nextSlide])

  return (
    <div className="pt-16 px-4 md:px-6 lg:px-8 bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <h2 className="text-2xl md:text-3xl font-bold text-[#FF6B38] mb-2">Our Testimonial</h2>
            <div className="h-1 w-full bg-blue-500 rounded" />
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mt-6">What our clients appreciate about us</h3>
        </div>

        {/* Testimonial Slider */}
        <div className="relative px-8">
          {/* Current Testimonial */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg">
            <div className="flex flex-col items-center text-center transition-opacity duration-300" key={currentIndex}>
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                <AvatarFallback>
                  {testimonials[currentIndex].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <h4 className="mt-4 text-xl font-semibold">{testimonials[currentIndex].name}</h4>

              <div className="flex gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonials[currentIndex].rating
                        ? "fill-[#FF6B38] text-[#FF6B38]"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>

              <p className="text-[#FF6B38] font-medium mb-4">{testimonials[currentIndex].institution}</p>

              <p className="text-gray-600 leading-relaxed max-w-2xl">{testimonials[currentIndex].text}</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            onClick={prevSlide}
            disabled={isAnimating}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg hover:bg-gray-100 z-10"
            onClick={nextSlide}
            disabled={isAnimating}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "bg-[#FF6B38] w-4" : "bg-gray-300"
                }`}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true)
                    setCurrentIndex(index)
                    setTimeout(() => setIsAnimating(false), 500)
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


