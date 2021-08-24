import { JwtPayload } from "jsonwebtoken";

interface TokenInterface extends JwtPayload {
   token_type: string;
   userId: string;
   iat: number;
   exp: number;
}

export default TokenInterface;
