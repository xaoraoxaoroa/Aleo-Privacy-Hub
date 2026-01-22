program privynotes_v1.aleo {
    // Non-upgradable constructor
    @noupgrade
    async constructor() {}

    record Note {
        owner: address,
        note_id: field,
        encrypted_title: field,
        encrypted_content_1: field,
        encrypted_content_2: field,
        encrypted_content_3: field,
        encrypted_content_4: field,
        created_at: u32,
        updated_at: u32,
        is_pinned: bool,
    }

    mapping user_note_count: field => u32;

    async transition create_note(
        note_id: field,
        encrypted_title: field,
        encrypted_content_1: field,
        encrypted_content_2: field,
        encrypted_content_3: field,
        encrypted_content_4: field
    ) -> (Note, Future) {
        let user_hash: field = BHP256::hash_to_field(self.caller);

        let note: Note = Note {
            owner: self.caller,
            note_id: note_id,
            encrypted_title: encrypted_title,
            encrypted_content_1: encrypted_content_1,
            encrypted_content_2: encrypted_content_2,
            encrypted_content_3: encrypted_content_3,
            encrypted_content_4: encrypted_content_4,
            created_at: 0u32,
            updated_at: 0u32,
            is_pinned: false,
        };

        return (note, finalize_create_note(user_hash));
    }

    async function finalize_create_note(user_hash: field) {
        let count: u32 = Mapping::get_or_use(user_note_count, user_hash, 0u32);
        Mapping::set(user_note_count, user_hash, count + 1u32);
    }

    transition update_note(
        old_note: Note,
        new_encrypted_title: field,
        new_encrypted_content_1: field,
        new_encrypted_content_2: field,
        new_encrypted_content_3: field,
        new_encrypted_content_4: field
    ) -> Note {
        assert_eq(old_note.owner, self.caller);

        return Note {
            owner: self.caller,
            note_id: old_note.note_id,
            encrypted_title: new_encrypted_title,
            encrypted_content_1: new_encrypted_content_1,
            encrypted_content_2: new_encrypted_content_2,
            encrypted_content_3: new_encrypted_content_3,
            encrypted_content_4: new_encrypted_content_4,
            created_at: old_note.created_at,
            updated_at: 0u32,
            is_pinned: old_note.is_pinned,
        };
    }

    transition toggle_pin(note: Note) -> Note {
        assert_eq(note.owner, self.caller);

        return Note {
            owner: note.owner,
            note_id: note.note_id,
            encrypted_title: note.encrypted_title,
            encrypted_content_1: note.encrypted_content_1,
            encrypted_content_2: note.encrypted_content_2,
            encrypted_content_3: note.encrypted_content_3,
            encrypted_content_4: note.encrypted_content_4,
            created_at: note.created_at,
            updated_at: 0u32,
            is_pinned: !note.is_pinned,
        };
    }

    async transition delete_note(note: Note) -> Future {
        assert_eq(note.owner, self.caller);
        let user_hash: field = BHP256::hash_to_field(self.caller);
        return finalize_delete_note(user_hash);
    }

    async function finalize_delete_note(user_hash: field) {
        let count: u32 = Mapping::get_or_use(user_note_count, user_hash, 1u32);
        Mapping::set(user_note_count, user_hash, count - 1u32);
    }
}
