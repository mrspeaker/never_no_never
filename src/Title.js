function Title (game, text, size, x, y, fixed) {

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ .,!?'\":-$                0123456789";
  const fontName = size === 9 ? "bmaxFont9" : "bmaxFont9x4";
  const fontSize = size === 9 ? 9 : 36;

  const title = game.add.retroFont(fontName, fontSize, fontSize, chars, 13, 0, 0, 0, 0);
  title.text = text + "";
  const img = game.add.image(x, y, title);
  if (fixed) img.fixedToCamera = true;
  img.data.title = title;
  return {
    img: img,
    set text (msg) { title.text = msg; },
    font: title
  };
}

export default Title;
