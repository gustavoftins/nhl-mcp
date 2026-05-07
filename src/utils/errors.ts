import { NhlApiError, NhlNotFoundError } from "../api/client.js";

export interface ToolError {
  error: string;
  message: string;
}

/**
 * Converts any thrown value into a structured ToolError.
 * MCP tool handlers must never throw — always return a content block.
 */
export function toToolError(err: unknown): ToolError {
  if (err instanceof NhlNotFoundError) {
    return { error: "not_found", message: err.message };
  }
  if (err instanceof NhlApiError) {
    return {
      error: "api_error",
      message: `NHL API returned status ${err.status}: ${err.message}`,
    };
  }
  if (err instanceof Error) {
    return { error: "unexpected_error", message: err.message };
  }
  return { error: "unknown", message: String(err) };
}

/**
 * Wraps a tool handler body. Returns the result as a JSON content block,
 * or a structured error block if anything throws.
 */
export async function safeToolCall<T>(
  fn: () => Promise<T>,
): Promise<{ content: Array<{ type: "text"; text: string }>; isError?: boolean }> {
  try {
    const result = await fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const toolError = toToolError(err);
    return {
      content: [{ type: "text", text: JSON.stringify(toolError, null, 2) }],
      isError: true,
    };
  }
}
