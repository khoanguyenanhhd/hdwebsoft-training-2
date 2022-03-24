import { AuthChecker } from "type-graphql";
import { AuthContext } from "./context";

export const authChecker: AuthChecker<AuthContext> = async (
  { context },
  roles
) => {
  try {
    const auth = context.req.auth;

    if (roles.length === 0) {
      return auth !== undefined;
    }

    if (!auth) {
      return false;
    }

    if (roles.includes(auth.role)) {
      return true;
    }

    return false;
  } catch (error) {
    throw new Error("Token is not authenticated");
  }
};
