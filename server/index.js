const express = require("express");

const PORT = process.env.PORT || 3001;
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
app.use(express.static(path.resolve(__dirname, '../client/build')));

const roleCheck = (currentPk) => {
  var now = new Date();

  var nowInSec = now.getTime() / 1000;
  var targetTime = 1;
  let wallets = fs
    .readFileSync("./server/wallets.txt", { encoding: "utf8", flag: "r" })
    .split("\n");

  let wlWalets = wallets.filter((a) => a.includes("Whitelisted"));
  let ogWallets = wallets.filter((a) => a.includes("OG WL"));
  let newList;
  let answer = false;

  if (
    ogWallets.filter((a) => a.split(";")[1] === currentPk)[0] &&
    targetTime - nowInSec < 0
  ) {
    newList = wallets
      .filter((a) => !a.includes(currentPk.slice(0, 6))).map((a)=> a.concat("\n"))
      .toString()
      .replace(/,/g,"");
    console.log(newList, "***********");
    fs.writeFile("./server/wallets.txt", newList, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    answer = true;
  } else if (
    wlWalets.filter((a) => a.split(";")[1] === currentPk)[0] &&
    targetTime - nowInSec < 0
  ) {
    newList = wallets
      .filter((a) => !a.includes(currentPk.slice(0, 6))).map((a)=> a.concat("\n"))
      .toString()
      .replace(/,/g, "");
    console.log(newList, "***********");

    fs.writeFile("./server/wallets.txt", newList, (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    answer = true;
  } else if (targetTime - nowInSec) {
    answer = false;
  } else answer = false;

  return answer;
};
const nftPicker = () => {
  let mintAddresses = fs
    .readFileSync("./server/mintAddresses.txt", { encoding: "utf8", flag: "r" })
    .split("\n")
    .filter((a) => a !== "");
  let parsedMintAddresses = mintAddresses.map((a) => a.split(";")[0]);
  let choosenIndex = Math.floor(Math.random() * mintAddresses.length);
  let choosenNft = parsedMintAddresses[choosenIndex];
  return choosenNft;
};

app.post("/data", jsonParser, async (req, res) => {
  try {
    console.log(req.body);
    const { wallet } = req.body;
    const { authorization } = req.headers;
    const hasPermission = await roleCheck(wallet);
    const pickedNft = await nftPicker(wallet);
    console.log(hasPermission);
    if (hasPermission) {
      
      let mintAddresses = fs
        .readFileSync("./server/mintAddresses.txt", {
          encoding: "utf8",
          flag: "r",
        })
        .split("\n");
      let a = mintAddresses
        .filter((a) => !a.includes(pickedNft))
        .map((a) => a.concat("\n"))
        .toString()
        .replace(/,/g, "");
      console.log(pickedNft, "pc");
      console.log(a);
      console.log(hasPermission,"---final metadata---",pickedNft)
      res.send({
        hasPermission,
        pickedNft,
      });
      fs.writeFile("./server/mintAddresses.txt", a, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
