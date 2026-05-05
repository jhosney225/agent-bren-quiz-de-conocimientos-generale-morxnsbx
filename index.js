const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function generateQuizQuestion(difficulty, category) {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate a multiple choice quiz question about ${category} with ${difficulty} difficulty. 
        Format your response as JSON with the following structure:
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0,
          "explanation": "Explanation of the correct answer"
        }
        Only respond with the JSON, no additional text.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";
  return JSON.parse(responseText);
}

async function main() {
  console.log("\n🎯 QUIZ DE CONOCIMIENTOS GENERALES 🎯");
  console.log("====================================\n");

  const categories = [
    "historia",
    "ciencia",
    "literatura",
    "geografía",
    "tecnología",
  ];
  const difficulties = ["fácil", "medio", "difícil"];

  let score = 0;
  let totalQuestions = 0;

  const numQuestions = 5;

  for (let i = 0; i < numQuestions; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const difficulty =
      difficulties[Math.floor(Math.random() * difficulties.length)];

    console.log(
      `\nPregunta ${i + 1}/${numQuestions} - Categoría: ${category} (Dificultad: ${difficulty})`
    );
    console.log("=".repeat(50));

    try {
      const quizData = await generateQuizQuestion(difficulty, category);

      console.log(`\n${quizData.question}\n`);

      quizData.options.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`);
      });

      let userAnswer = -1;
      let validInput = false;

      while (!validInput) {
        const input = await question("\nTu respuesta (1-4): ");
        const answerNum = parseInt(input);

        if (answerNum >= 1 && answerNum <= 4) {
          userAnswer = answerNum - 1;
          validInput = true;
        } else {
          console.log("Por favor, ingresa un número entre 1 y 4.");
        }
      }

      totalQuestions++;

      if (userAnswer === quizData.correct) {
        console.log("\n✅ ¡CORRECTO!");
        score++;
      } else {
        console.log(
          `\n❌ Respuesta incorrecta. La respuesta correcta era la opción ${quizData.correct + 1}: ${quizData.options[quizData.correct]}`
        );
      }

      console.log(`\n📚 ${quizData.explanation}`);
    } catch (error) {
      console.error(`Error generando pregunta: ${error.message}`);
      totalQuestions++;
    }
  }

  console.log("\n\n" + "=".repeat(50));
  console.log("📊 RESULTADOS FINALES");
  console.log("=".repeat(50));
  console.log(`Preguntas correctas: ${score}/${totalQuestions}`);
  const percentage = Math.round((score / totalQuestions) * 100);
  console.log(`Porcentaje: ${percentage}%`);

  if (percentage === 100) {
    console.log("🏆 ¡PUNTUACIÓN PERFECTA! ¡Eres un experto!");
  } else if (percentage >= 80) {
    console.log("🥇 ¡Excelente desempeño! Muy bien hecho.");
  } else if (percentage >= 60) {
    console.log("🥈 Buen trabajo. Sigue practicando.");
  } else if (percentage >= 40) {
    console.log("🥉 Necesitas practicar más. Sigue intentando.");
  } else {
    console.log(
      "💪 No te desanimes. El conocimiento se construye con la práctica."
    );
  }

  console.log("\n¡Gracias por jugar! 👋\n");
  rl.close();
}

main().catch(console.error);