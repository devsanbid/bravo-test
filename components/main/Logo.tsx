import Image from "next/image"

// Livvic font

interface BravoLogoInterface {
  width: number,
  height: number
}
const BravoLogo = ({ width, height }: BravoLogoInterface) => {
  return <div className="border">
    <Image src="/logo/logo.jpg" width={width} height={height} alt="logo" />
  </div>
}

export { BravoLogo }
