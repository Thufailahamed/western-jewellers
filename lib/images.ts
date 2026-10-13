// Photography. These are placeholder images from Unsplash (free to use under the Unsplash License),
// chosen to match the brand's warm, light palette. Replace each `src` with the house's own shoots.

export type Img = { src: string; alt: string; credit: string };

const u = (id: string, alt: string, credit: string): Img => ({ src: `https://images.unsplash.com/${id}`, alt, credit });

export const IMG = {
  // Worn
  handSolitaire: u("photo-1529519195486-16945f0fb37f", "Two hands held together, one wearing a diamond solitaire", "Alekon Pictures"),
  handsBands: u("photo-1529634597503-139d3726fed5", "A couple's hands resting together, both wearing wedding bands", "Samantha Gades"),
  handRing: u("photo-1723522938769-4f26effdd1f1", "A hand wearing a square-cut diamond ring", "Prahant Studio"),
  handsWhite: u("photo-1614606140245-2c33ece9e2cf", "Hands clasped against a white shirt, wearing fine gold rings", "Sama Hosseini"),
  neckPendant: u("photo-1762505464446-c0760d740aee", "A diamond pendant worn at the collarbone, with a diamond ring", "Shoham Avisrur"),
  necklaceWarm: u("photo-1673178875233-a1f2e0124b7e", "A fine diamond necklace worn on bare skin", "John Rst"),
  shirtNecklace: u("photo-1616294099799-dab525ec05c1", "A woman in a white shirt wearing a fine pendant", "Amanda Hortiz"),
  earDrop: u("photo-1621939745912-aad97fd3a34d", "A diamond drop earring", "Julia Cheperis"),
  wristBangle: u("photo-1708221235482-a6e2a807198f", "A slim gold bangle worn on the wrist", "Oscar Ramirez"),
  chainBracelet: u("photo-1633810543462-77c4a3b13f07", "A gold chain bracelet on the wrist", "Sama Hosseini"),
  portraitEarring: u("photo-1611653842967-39eb011b2ca3", "A woman in a white shirt wearing drop earrings", "Kateryna Hliznitsova"),
  portrait: u("photo-1634149136549-47350a401065", "Portrait of a woman wearing fine earrings", "Olena Bohovyk"),

  // Still life
  bandsGold: u("photo-1622398925373-3f91b1e275f5", "Two interlocking gold wedding bands on cream fabric", "Mariano Rivas"),
  bandsLinen: u("photo-1606800052052-a08af7148866", "Gold wedding bands on linen", "Sandy Millar"),
  bandsWhite: u("photo-1627293509201-cd0c780043e6", "Two wedding bands on white cloth", "Alexis Antoine"),
  hoops: u("photo-1708220040824-b273dd0a17cc", "Gold hoop earrings on a white stand", "Oscar Ramirez"),
  drops: u("photo-1727990864588-757416bf8062", "Gold drop earrings on a white sheet", "Diego Castañeda"),
  bangleSilk: u("photo-1655707063513-a08dad26440e", "A gold bangle on white silk", "Imam Kurniawan"),
  ringsDish: u("photo-1561828995-aa79a2db86dd", "Gold rings and earrings in a small ceramic dish", "Tessa Edmiston"),
  haloRing: u("photo-1700062409662-756e8c4bcc73", "A halo diamond ring resting on handwritten paper", "The Now Time"),

  // Atelier
  benchWoman: u("photo-1772442125267-7640b4b5f2fe", "A jeweller working at her bench", "GN Group"),
  benchExamine: u("photo-1772442125263-c9dd28bbd938", "A jeweller examining a ring at the bench", "GN Group"),
  benchPortrait: u("photo-1772442125299-dc4d557ec273", "A young jeweller at her workbench", "GN Group"),
  makerLoupe: u("photo-1764760214881-69e2a3198c11", "A master jeweller wearing magnifying glasses in the workshop", "Caden Norcott"),
  makerSaw: u("photo-1786840320410-a7bec09c393c", "A jeweller cutting a ring with a piercing saw", "Spencer Liao"),
  workshop: u("photo-1754598638178-2b97471d080c", "A jeweller's bench with tools", "Jeremy Hoye"),
  drawing: u("photo-1724638197367-1bab34842f90", "A technical drawing of a ring on the bench", "Declan Sun"),
  casting: u("photo-1751979362679-8687eb4d9301", "Molten metal being poured into moulds", "Joseph Grieveson"),
  setting: u("photo-1516652695352-6118f7cc1a07", "Hands setting a stone under a loupe", "Jacek Dylag"),
  polishing: u("photo-1623304741393-54f6c11c0da6", "A ring being polished at the bench", "Tahlia Doyle"),
} satisfies Record<string, Img>;

export type ImgKey = keyof typeof IMG;
