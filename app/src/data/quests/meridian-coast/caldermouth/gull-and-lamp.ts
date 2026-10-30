import { Quest } from "../../../../models/quest";
import { returnLoan } from "../../../../systems/inventory";

new Quest(
  "talk-wenna",
  "main",
  "Osric's things",
  "Wenna Tarrow at the Gull & Lamp knew Osric. She opens at noon.",
  { kind: "talk", npc: "wenna-tarrow" },
  {
    chain: "The inheritance",
    narration:
      '"Kin," Wenna says, looking at you longer than she needs to. Her eyes go to your hip. "He left some things here, if you\'ve room for them."',
    next: "arm-yourself",
  }
);

new Quest(
  "arm-yourself",
  "main",
  "Something to carry",
  "Choose what to carry.",
  { kind: "armed" },
  { chain: "The inheritance", next: "the-tide-cave" }
);

new Quest(
  "osrics-shipment",
  "main",
  "Osric's shipment",
  "Wenna knows who took Osric's last shipment. Ask her.",
  { kind: "talk", npc: "wenna-tarrow" },
  {
    chain: "The Gullwrights",
    visible: { complete: ["the-tide-cave"] },
    narration:
      '"Gullwrights," Wenna says, low. "Sable Wrenn\'s crew, in the caves under the harbor. Took his last crate the week he died and nobody asked why." She wipes a glass that\'s clean. "Nobody asks the Gullwrights anything."',
    next: "the-harbor-caves",
  }
);

new Quest(
  "return-the-loan",
  "main",
  "Osric's things, returned",
  "Take Osric's gear back to Wenna at the Gull & Lamp. She opens at noon.",
  { kind: "talk", npc: "wenna-tarrow" },
  {
    chain: "The inheritance",
    onComplete: (s) => returnLoan(s, "wenna-tarrow"),
    narration:
      "Wenna takes the gear back without looking at it and sets it under the bar. \"So he did find something down there. Two people want you now. Marrow, about Fenn's paper — and the name in that journal. Ira Vell keeps the sword yard off the square. Buy a blade of your own before you stand in it; Pell's window sells them.\"",
    next: ["fenns-lien", "a-masters-word"],
  }
);

if (import.meta.hot) import.meta.hot.accept();
