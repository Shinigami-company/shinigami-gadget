const INPUT_FILE_NAME = "lang.json";
const OUTPUT_FILE_NAME = "fished.json";

function fishify(input) {
  return input.replace(
    /("(?:[^"\\]|\\.)+"\s*:\s*")([\s\S]+?)("(?:,)?)/g,
    (_, keyPart, value, closing) => {
      return keyPart + fishifyValue(value) + closing;
    }
  );
}

function fishifyValue(value) {
  const tokenRegex = /(\$\[[^\]]*\]|<[^>]+>|<|>|\*\*|¤|[.,?!]|[^\s<>*$¤.,?!]+)/g;
  const tokens = [];
  let match;
  while ((match = tokenRegex.exec(value)) !== null) {
    tokens.push(match[1]);
  }

  return tokens.map(token => {
    if (/^\$\[/.test(token)) return token;// preserve $[...] var
    if (/^<[^>]/.test(token)) return token;// preserve <tag> var
    if (token === '<') return '<';
    if (token === '>') return '>';
    if (token === '*') return '*';
    if (token === '**') return '**';
    if (token === '¤') return '¤';
    if (/^[.,?!]$/.test(token)) return '';// remove punctuation
    return '🐟';// any words to fish
  }).join('');
}

const fs = require("fs");

const input = fs.readFileSync(INPUT_FILE_NAME, "utf-8");
const output = fishify(input);
fs.writeFileSync(OUTPUT_FILE_NAME, output);

console.log(`✅ file fishified ${INPUT_FILE_NAME} → ${OUTPUT_FILE_NAME}`);