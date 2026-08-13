import { signupUser } from "@/lib/auth/actions";
import { AppError, firstZodError } from "@/lib/errors";
import { handleRouteError, jsonError, jsonOk } from "@/lib/http";
import { signupSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(firstZodError(parsed.error), 400);
    }

    const { account } = await signupUser(parsed.data.email, parsed.data.password);

    return jsonOk({
      ok: true,
      account: { id: account.id, slug: account.slug },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("unique") || message.includes("duplicate")) {
      return jsonError("An account with this email already exists", 409);
    }
    if (err instanceof AppError) {
      return jsonError(err.message, err.statusCode);
    }
    return handleRouteError("signup", err, "Signup failed");
  }
}
