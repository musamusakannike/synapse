import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = "mongodb+srv://musamusakannike:pI8tOdkQqk34Vf4e@cluster0.rrmr4ge.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "synapse";
const USER_EMAIL = "musamusakannike@gmail.com";

// Quiz data will be loaded from JSON
import { readFileSync } from "fs";
const rawData = JSON.parse(readFileSync("/Users/MACBOOK/Documents/FULLSTACK/synapse/get210_quiz_data.json", "utf-8"));
const quizzes = Array.isArray(rawData) ? rawData : [rawData];

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const user = await db.collection("users").findOne({ email: USER_EMAIL });
  if (!user) {
    console.error(`User with email ${USER_EMAIL} not found!`);
    process.exit(1);
  }
  const userId = user._id.toString();
  console.log(`Found user: ${user.name} (${userId})`);

  // Delete old GET210 quizzes for this user
  const deleteResult = await db.collection("quizzes").deleteMany({ userId, title: "GET210 PAST QUESTIONS" });
  console.log(`Deleted ${deleteResult.deletedCount} old quiz(es)`);

  for (const quiz of quizzes) {
    const result = await db.collection("quizzes").insertOne({
      userId,
      title: quiz.title,
      topic: quiz.topic,
      questions: quiz.questions,
      attempts: [],
      createdAt: new Date(),
    });
    console.log(`Inserted quiz: "${quiz.title}" (${quiz.questions.length} questions) -> ${result.insertedId}`);
  }

  await client.close();
  console.log("Done!");
}

main().catch((e) => { console.error(e); process.exit(1); });
