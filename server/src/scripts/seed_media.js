require("dotenv").config();
const mongoose = require("mongoose");
const Media = require("../modules/media/media.model");

const rawData = [
  { tag: "Spardha", urls: ["https://youtu.be/HJQYyCE7qe4?si=X8Te-OfsMIh827K4", "https://youtu.be/hKSPM3-tHOk?si=LI1yAha0lkT5wtmR"] },
  { tag: "Prayas", urls: ["https://youtu.be/FhsgggPYNsE?si=zgMIY1KL2_5zr99E", "https://youtu.be/pflm6oHzRAM?si=7H12PObTADiY9-ct", "https://youtu.be/r7Z68ChynOA?si=Jh9h09MWbBEjioLS"] },
  { tag: "Holi", urls: ["https://youtu.be/CZcPRjU_4Q8?si=qf6oJSM592_6K69p", "https://youtu.be/QQ2B_QiYpH4?si=ANi0nJcGr43UtCFl"] },
  { tag: "Hillfair", urls: ["https://youtu.be/jY8BpDg4un4?si=cNxIEewU8BeaX9dY", "https://youtu.be/YKzMq2hiN7A?si=gdJrV5PTwgGwoet1", "https://youtu.be/yvbmpERdKtc?si=La5zaXtAxeuk4jcv"] },
  { tag: "Activities", urls: ["https://youtu.be/pvn_1yfwNHo?si=4o3hvxQICw6Qt6xd"] },
  { tag: "Health Camp", urls: ["https://youtu.be/b1Ce96yfe5M?si=EoRytig8meEJQnQy"] }
];

const mediaDocs = [];

rawData.forEach((group) => {
  group.urls.forEach((url, index) => {
    mediaDocs.push({
      title: `${group.tag} Highlight ${index + 1}`,
      youtubeUrl: url,
      tag: group.tag,
      order: index,
      isActive: true
    });
  });
});

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  const result = await Media.insertMany(mediaDocs, { ordered: false });
  console.log(`Inserted ${result.length} media records.`);
  result.forEach(m => console.log(` ✔  [${m.tag}] ${m.title}`));

  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
