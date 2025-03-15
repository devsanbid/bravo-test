import * as jose from "jose";
import type { UserDataInterface } from "@/lib/type";

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "your-secret-key",
);

export const createJWT = async (user: UserDataInterface) => {
	const jwt = await new jose.SignJWT(user)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("30d")
		.sign(JWT_SECRET);

	return jwt;
};

export const verifyJWT = async(token: string) => {
	try {
		return await jose.jwtVerify(token, JWT_SECRET);
	} catch (error) {
		console.log("JWT payload error: ", error);
		return null;
	}
};
