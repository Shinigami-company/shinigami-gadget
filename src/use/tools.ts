
export function copyAttrs(source: any, target: any) {
  const keys = Object.keys(target); // Get all property keys defined in the class
  keys.forEach(key => {
    if (key in source) {
      target[key] = source[key];
    }
  });
}

export function string_emoji(emojiObj)
{
  return `<:${emojiObj.name}:${emojiObj.id}>`;
}