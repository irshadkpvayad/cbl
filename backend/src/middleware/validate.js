import { ZodError } from "zod";
import { HttpError } from "../utils/errors.js";

export function validate(schema) {
  return (req, _res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      req.body = parsed.body ?? req.body;
      req.query = parsed.query ?? req.query;
      req.params = parsed.params ?? req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new HttpError(422, "Validation failed", error.flatten()));
      }
      next(error);
    }
  };
}
