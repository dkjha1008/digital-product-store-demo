import { loginUser } from "@/lib/auth/actions";
import { AppError, firstZodError } from "@/lib/errors";
import { handleRouteError, jsonError, jsonOk } from "@/lib/http";
import { loginSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(firstZodError(parsed.error), 400);
    }

    await loginUser(parsed.data.email, parsed.data.password);
    return jsonOk({ ok: true });
  } catch (err) {
    if (err instanceof AppError) {
      return jsonError(err.message, err.statusCode);
    }
    return handleRouteError("login", err, "Login failed");
  }
}
