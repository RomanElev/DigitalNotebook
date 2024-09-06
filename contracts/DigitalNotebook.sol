// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

contract DigitalNotebook {
    struct Note {
        string content;
        address owner;
        bool isPublic;
        address[] sharedWith;
    }

    mapping(uint256 => Note) private notes;
    mapping(address => uint256[]) private userNotes;
    uint256 private noteCounter;

    event NoteCreated(uint256 noteId, address indexed owner);
    event NoteUpdated(uint256 noteId);
    event NoteDeleted(uint256 noteId);
    event NoteShared(uint256 noteId, address indexed sharedWith);


    constructor() {
        noteCounter = 0;
    }

    // Modifier för att kontrollera om användaren är ägare av anteckningen
    modifier onlyOwner(uint256 noteId) {
        require(notes[noteId].owner == msg.sender, "Only the owner can do this");
        _;
    }

    // Skapar en ny anteckning
    function createNote(string memory content, bool isPublic) public {
        noteCounter++;
        notes[noteCounter] = Note({
            content: content,
            owner: msg.sender,
            isPublic: isPublic,
            sharedWith: new address[](0)
            });
        userNotes[msg.sender].push(noteCounter);
        emit NoteCreated(noteCounter, msg.sender);
    }

    // Läser en anteckning
    function readNote(uint256 noteId) public view returns (string memory) {
        require(noteExists(noteId), "The note does not exist");
        Note storage note = notes[noteId];
        require(
            note.isPublic || note.owner == msg.sender || isSharedWithUser(noteId, msg.sender),
            "You do not have permission to read this note"
        );
        return note.content;
    }

    // Justerar delningsinställningar för en anteckning
    function updateSharing(uint256 noteId, bool isPublic, address[] memory sharedWith) public onlyOwner(noteId) {
        require(noteExists(noteId), "The note does not exist");
        Note storage note = notes[noteId];
        note.isPublic = isPublic;
        delete note.sharedWith;
        for (uint256 i = 0; i < sharedWith.length; i++) {
            note.sharedWith.push(sharedWith[i]);
            emit NoteShared(noteId, sharedWith[i]);
        }

        emit NoteUpdated(noteId);
    }

    // Tar bort en anteckning
    function deleteNote(uint256 noteId) public onlyOwner(noteId) {
        require(noteExists(noteId), "The note does not exist");
        delete notes[noteId];

        // Tar bort anteckningen från användarens lista
        uint256[] storage userNoteList = userNotes[msg.sender];
        for (uint256 i = 0; i < userNoteList.length; i++) {
            if (userNoteList[i] == noteId) {
                userNoteList[i] = userNoteList[userNoteList.length - 1];
                userNoteList.pop();
                break;
            }
        }

        emit NoteDeleted(noteId);
    }

    // Kontrollerar om en anteckning existerar
    function noteExists(uint256 noteId) internal view returns (bool) {
        return notes[noteId].owner != address(0);
    }

    // Kontrollerar om en användare har delad tillgång till en anteckning
    function isSharedWithUser(uint256 noteId, address user) internal view returns (bool) {
        Note storage note = notes[noteId];
        for (uint256 i = 0; i < note.sharedWith.length; i++) {
            if (note.sharedWith[i] == user) {
                return true;
            }
        }
        return false;
    }

    // Hämtar en lista över alla anteckningar som en användare äger
    function getUserNotes() public view returns (uint256[] memory) {
        return userNotes[msg.sender];
    }
}
