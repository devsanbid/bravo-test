import { Mail, MapPin, Phone, Clock, Send, Facebook, Linkedin, Youtube, Instagram } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <img src="/placeholder.svg?height=60&width=200" alt="Bravos International" className="h-12 w-auto" />
            <p className="text-gray-600 leading-relaxed">It has been an unbelievable journey at Bravo since its establishment. I wouldn’t say it has always been easy though as we not only have celebrated successes but have also suffered disappointments, but with each failure we fell forward and stuck to the right</p>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-[#C25934] hover:border-[#C25934] hover:text-white transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-[#C25934] hover:border-[#C25934] hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-[#C25934] hover:border-[#C25934] hover:text-white transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-[#C25934] hover:border-[#C25934] hover:text-white transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* IT Services */}
          <div>
            <h3 className="text-xl font-bold mb-6">Services</h3>
            <ul className="space-y-4">
              {[
                "ITELS",
                "PTE",
                "GRE",
                "TOELF",
                "Bridge course",
              ].map((service, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#C25934] hover:translate-x-1 transition-all inline-block"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-[#C25934] mt-1" />
                <span>Putalisadak Chowk Kathmandu </span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-[#C25934] mt-1" />
                <span>+977 - 9851352807 / 015908733</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <Mail className="w-5 h-5 text-[#C25934] mt-1" />
                <span>info@bravointernational.edu.np</span>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <Clock className="w-5 h-5 text-[#C25934] mt-1" />
                <span>Opening Hours: 9AM 18PM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold mb-6">Newsletter</h3>
            <p className="text-gray-600 mb-4">
              Sign up now and get latest updates on our offers and services along with new products and features before
              anyone else
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="w-full border-gray-200 focus:border-[#C25934] focus:ring-[#C25934]"
                />
              </div>
              <Button size="icon" className="bg-[#C25934] hover:bg-[#A64B2A] text-white rounded-lg">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2023 All Rights Reserved. Developed By Bravos International</p>
          <nav className="flex items-center gap-6">
            {["Home", "About", "Blog", "FAQs"].map((item, index) => (
              <a key={index} href="#" className="text-gray-600 hover:text-[#C25934] text-sm">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}


