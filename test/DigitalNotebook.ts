import { expect } from "chai";
import { ethers } from "hardhat";

describe("DigitalNotebook", function () {
  let DigitalNotebook: any;
  let digitalNotebook: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Hämtar kontraktsfabriken
    DigitalNotebook = await ethers.getContractFactory("DigitalNotebook");

    // Distribuerar kontraktet och väntar på svar
    digitalNotebook = await DigitalNotebook.deploy();
  });

  it("Should create a note", async function () {
    await digitalNotebook.createNote("Note 1", true);
    const userNotes = await digitalNotebook.getUserNotes();
    expect(userNotes.length).to.equal(1);
    const noteId = userNotes[0];
    const note = await digitalNotebook.readNote(noteId);
    expect(note).to.equal("Note 1");
  });

  it("Should read a public note", async function () {
    await digitalNotebook.createNote("Public Note", true);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    const content = await digitalNotebook.readNote(noteId);
    expect(content).to.equal("Public Note");
  });

  it("Should not allow non-owners to read a private note", async function () {
    await digitalNotebook.createNote("Private Note", false);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    await expect(
      digitalNotebook.connect(addr1).readNote(noteId)
    ).to.be.revertedWith("You do not have permission to read this note");
  });

  it("Should allow owner to update sharing settings", async function () {
    await digitalNotebook.createNote("Private Note", false);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    await digitalNotebook.updateSharing(noteId, true, [addr1.address]);
    const note = await digitalNotebook.readNote(noteId);
    expect(note).to.equal("Private Note");
  });

  it("Should not allow non-owners to update sharing settings", async function () {
    await digitalNotebook.createNote("Private Note", false);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    await expect(
      digitalNotebook
        .connect(addr1)
        .updateSharing(noteId, true, [addr1.address])
    ).to.be.revertedWith("Only the owner can do this");
  });

  it("Should delete a note", async function () {
    await digitalNotebook.createNote("Note to Delete", true);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    await digitalNotebook.deleteNote(noteId);
    await expect(digitalNotebook.readNote(noteId)).to.be.revertedWith(
      "The note does not exist"
    );
  });

  it("Should not allow deleting a non-existent note", async function () {
    await expect(digitalNotebook.deleteNote(9999)).to.be.revertedWith(
      "The note does not exist"
    );
  });

  it("Should update sharing settings and emit events correctly", async function () {
    await digitalNotebook.createNote("Note to Update", false);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];

    // Listener for events
    const tx = await digitalNotebook.updateSharing(noteId, true, [
      addr1.address,
    ]);
    const receipt = await tx.wait();

    // Check events
    const noteUpdatedEvent = receipt.events?.find(
      (event: any) => event.event === "NoteUpdated"
    );
    const noteSharedEvent = receipt.events?.find(
      (event: any) => event.event === "NoteShared"
    );

    expect(noteUpdatedEvent).to.not.be.undefined;
    expect(noteSharedEvent).to.not.be.undefined;
    expect(noteSharedEvent.args?.sharedWith).to.equal(addr1.address);
  });

  it("Should return correct list of user notes", async function () {
    await digitalNotebook.createNote("Note 1", true);
    await digitalNotebook.createNote("Note 2", true);
    const userNotes = await digitalNotebook.getUserNotes();
    expect(userNotes.length).to.equal(2);
  });

  it("Should correctly handle sharing notes with multiple users", async function () {
    await digitalNotebook.createNote("Shared Note", false);
    const userNotes = await digitalNotebook.getUserNotes();
    const noteId = userNotes[0];
    await digitalNotebook.updateSharing(noteId, false, [
      addr1.address,
      addr2.address,
    ]);

    // Check if sharing is updated correctly
    expect(await digitalNotebook.isSharedWithUser(noteId, addr1.address)).to.be
      .true;
    expect(await digitalNotebook.isSharedWithUser(noteId, addr2.address)).to.be
      .true;
  });
});
