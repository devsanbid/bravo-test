"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { BravoLogo } from "@/components/main/Logo";
import HeadLine from "@/components/main/HeadLine";
import { Menu, X, User as UserIcon } from "lucide-react";
//import UserChat from '../../../chat/UserChat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState< null>(null);

  const handleSignOut = async () => {
    router.push("/");
  };

  useEffect(() => {
    async function run() {

    }
  })

  return (
    <div className="w-full sticky top-0 z-50 bg-white">
      <HeadLine />

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <BravoLogo width={100} height={100} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavigationMenu>
					<NavigationMenuList>
						<NavigationMenuItem>
							<Link href="/" legacyBehavior passHref>
								<NavigationMenuLink className="group font-semibold lg:text-lg  inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
									Home
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<NavigationMenuTrigger className="font-semibold lg:text-lg">About</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="grid w-48 gap-3 p-4">
									<li>
										<NavigationMenuLink asChild>
											<Link
												href="/about/faqs"
												className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
											>
												FAQs
											</Link>
										</NavigationMenuLink>
									</li>
									<li>
										<NavigationMenuLink asChild>
											<Link
												href="/about/team"
												className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
											>
												Our Teams
											</Link>
										</NavigationMenuLink>
									</li>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<NavigationMenuTrigger className="font-semibold lg:text-lg">Services</NavigationMenuTrigger>
							<NavigationMenuContent>
								<ul className="grid w-[500px] grid-cols-2 gap-3 p-4">
									<li className="row-span-3">
										<NavigationMenuLink asChild>
											<div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
												<div className="mb-2 mt-4 text-lg font-bold">
													Study Abroad
												</div>
												<ul className="grid gap-2">
													<li>
														<Link
															href="/services/study/usa"
															className="hover:underline"
														>
															Study in USA
														</Link>
													</li>
													<li>
														<Link
															href="/services/study/australia"
															className="hover:underline"
														>
															Study in Australia
														</Link>
													</li>
													<li>
														<Link
															href="/services/study/europe"
															className="hover:underline"
														>
															Study in Europe
														</Link>
													</li>
													<li>
														<Link
															href="/services/study/canada"
															className="hover:underline"
														>
															Study in Canada
														</Link>
													</li>
													<li>
														<Link
															href="/services/study/japan"
															className="hover:underline"
														>
															Study in Japan
														</Link>
													</li>
													<li>
														<Link
															href="/services/study/india"
															className="hover:underline"
														>
															Study in India
														</Link>
													</li>
												</ul>
											</div>
										</NavigationMenuLink>
									</li>
									<li className="row-span-3">
										<NavigationMenuLink asChild>
											<div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
												<div className="mb-2 mt-4 text-lg font-bold">
													Test Registration
												</div>
												<ul className="grid gap-2">
													<li>
														<Link
															href="/services/test/ielts"
															className="hover:underline"
														>
															IELTS
														</Link>
													</li>
													<li>
														<Link
															href="/services/test/pte"
															className="hover:underline"
														>
															PTE-P
														</Link>
													</li>
													<li>
														<Link
															href="/services/test/toefl"
															className="hover:underline"
														>
															TOEFL
														</Link>
													</li>
													<li>
														<Link
															href="/services/test/celpip"
															className="hover:underline"
														>
															CELPIP
														</Link>
													</li>
												</ul>
											</div>
										</NavigationMenuLink>
									</li>
									<li className="col-span-2">
										<NavigationMenuLink asChild>
											<div className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
												<div className="mb-2 mt-4 text-lg font-bold">
													Test Preparation
												</div>
												<ul className="grid grid-cols-3 gap-2">
													<li>
														<Link
															href="/services/prep/ielts"
															className="hover:underline"
														>
															IELTS
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/pte"
															className="hover:underline"
														>
															PTE
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/toefl"
															className="hover:underline"
														>
															TOEFL
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/sat"
															className="hover:underline"
														>
															SAT
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/gre"
															className="hover:underline"
														>
															GRE
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/bridge"
															className="hover:underline"
														>
															Bridge Course
														</Link>
													</li>
													<li>
														<Link
															href="/services/prep/mock"
															className="hover:underline"
														>
															Mock Test
														</Link>
													</li>
												</ul>
											</div>
										</NavigationMenuLink>
									</li>
								</ul>
							</NavigationMenuContent>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<Link href="/projects" legacyBehavior passHref>
								<NavigationMenuLink className="group lg:text-lg inline-flex font-semibold lg:text-lg h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
									Projects
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<Link href="/blog" legacyBehavior passHref>
								<NavigationMenuLink className="group lg:text-lg font-semibold inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm  transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
									Blog
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>

						<NavigationMenuItem>
							<Link href="/contact" legacyBehavior passHref>
								<NavigationMenuLink className="group lg:text-lg font-semibold inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm  transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
									Contact
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.email}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" onClick={() => router.push("/login")}>
                    Login
                  </Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => router.push("/register")}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[144px] bg-white z-50 overflow-y-auto">
            <nav className="flex flex-col p-4">
              <Link href="/" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/about" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link href="/services" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                Services
              </Link>
              <Link href="/projects" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                Projects
              </Link>
              <Link href="/blog" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                Blog
              </Link>
              <Link href="/contact" className="py-2 hover:text-orange-500" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </nav>
            
            <div className="pt-4 space-y-3 p-4">
              <UserChat />
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 border-t">
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4"
                    onClick={() => {
                      router.push("/dashboard");
                      setIsMenuOpen(false);
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4"
                    onClick={() => {
                      router.push("/settings");
                      setIsMenuOpen(false);
                    }}
                  >
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 text-red-500"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      router.push("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    onClick={() => {
                      router.push("/register");
                      setIsMenuOpen(false);
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
