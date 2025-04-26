import dbConnect from "../lib/mongodb"
import Word from "../models/Word"

// Sample Balti-English word pairs
const sampleWords = [
  { balti: "ཆུ", english: "water" },
  { balti: "མེ", english: "fire" },
  { balti: "ས", english: "earth" },
  { balti: "རླུང", english: "air" },
  { balti: "ཉི་མ", english: "sun" },
  { balti: "ཟླ་བ", english: "moon" },
  { balti: "སྐར་མ", english: "star" },
  { balti: "ནམ་མཁའ", english: "sky" },
  { balti: "རི", english: "mountain" },
  { balti: "མཚོ", english: "lake" },
  { balti: "ཤིང", english: "tree" },
  { balti: "མེ་ཏོག", english: "flower" },
  { balti: "འབྲས", english: "fruit" },
  { balti: "ཟས", english: "food" },
  { balti: "ཆང", english: "drink" },
  { balti: "ཁྱི", english: "dog" },
  { balti: "བྱི་ལ", english: "cat" },
  { balti: "རྟ", english: "horse" },
  { balti: "བ", english: "cow" },
  { balti: "ལུག", english: "sheep" },
  { balti: "བྱ", english: "bird" },
  { balti: "ཉ", english: "fish" },
  { balti: "མི", english: "person" },
  { balti: "བུ", english: "boy" },
  { balti: "བུ་མོ", english: "girl" },
  { balti: "ཕ", english: "father" },
  { balti: "མ", english: "mother" },
  { balti: "སྤུན", english: "sibling" },
  { balti: "གྲོགས་པོ", english: "friend" },
  { balti: "དགྲ", english: "enemy" },
  { balti: "ཁང་པ", english: "house" },
  { balti: "སྒོ", english: "door" },
  { balti: "སྒེའུ་ཁུང", english: "window" },
  { balti: "ལམ", english: "road" },
  { balti: "གྲོང་ཁྱེར", english: "city" },
  { balti: "གྲོང་གསེབ", english: "village" },
  { balti: "རྒྱལ་ཁབ", english: "country" },
  { balti: "འཛམ་གླིང", english: "world" },
  { balti: "ནམ་ལངས", english: "morning" },
  { balti: "ཉིན་གུང", english: "noon" },
  { balti: "དགོང་མོ", english: "evening" },
  { balti: "མཚན་མོ", english: "night" },
  { balti: "དབྱར་ཁ", english: "summer" },
  { balti: "སྟོན་ཁ", english: "autumn" },
  { balti: "དགུན་ཁ", english: "winter" },
  { balti: "དཔྱིད་ཁ", english: "spring" },
  { balti: "ལོ", english: "year" },
  { balti: "ཟླ་བ", english: "month" },
  { balti: "བདུན་ཕྲག", english: "week" },
  { balti: "ཉིན་མ", english: "day" },
]

async function addSampleData() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await dbConnect()
    console.log("✅ MongoDB connected successfully!")

    // Check if there's already data in the collection
    const existingCount = await Word.countDocuments()
    console.log(`📊 Found ${existingCount} existing words in the database.`)

    if (existingCount > 0) {
      const shouldContinue = process.argv.includes("--force")
      if (!shouldContinue) {
        console.log("⚠️ Database already contains words. Use --force flag to add sample data anyway.")
        process.exit(0)
      }
      console.log("🔄 Force flag detected. Adding sample data anyway...")
    }

    // Insert the sample words
    console.log(`🔄 Adding ${sampleWords.length} sample Balti-English word pairs...`)
    const result = await Word.insertMany(sampleWords)
    console.log(`✅ Successfully added ${result.length} sample words to the database!`)

    // Display some of the added words
    console.log("\n📋 Sample of added words:")
    result.slice(0, 5).forEach((word) => {
      console.log(`- ${word.balti} : ${word.english}`)
    })
    console.log("...")
  } catch (error) {
    console.error("❌ Error adding sample data:", error)
  } finally {
    // Close the connection
    console.log("🔄 Closing MongoDB connection...")
    process.exit(0)
  }
}

// Run the function
addSampleData()
