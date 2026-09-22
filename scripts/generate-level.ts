import { questions } from "../src/content";
import { generateLevel } from "../src/engine/generator";
const args = process.argv.slice(2).filter((arg) => arg !== "--");
try {
  if (args.length !== 2)
    throw new Error("Usage: npm run generate:level -- <level-number> <seed>");
  const level = generateLevel(questions, {
    id: Number(args[0]),
    seed: args[1],
  });
  // A reviewable draft only: this command does not publish levels or touch player data.
  process.stdout.write(JSON.stringify(level, null, 2) + "\n");
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
