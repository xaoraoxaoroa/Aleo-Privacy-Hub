program privymsg_v1.aleo {
    // Non-upgradable constructor
    @noupgrade
    async constructor() {}

    // Message record - only recipient can read
    record Message {
        owner: address,
        message_id: field,
        sender_hash: field,
        encrypted_content: field,
        encrypted_content_2: field,
        timestamp: u32,
        is_read: bool,
    }

    // Sent proof for sender
    record SentProof {
        owner: address,
        message_id: field,
        recipient_hash: field,
        timestamp: u32,
    }

    mapping inbox_count: field => u32;
    mapping message_exists: field => bool;

    async transition send_message(
        recipient: address,
        message_id: field,
        encrypted_content: field,
        encrypted_content_2: field
    ) -> (Message, SentProof, Future) {
        let sender_hash: field = BHP256::hash_to_field(self.caller);
        let recipient_hash: field = BHP256::hash_to_field(recipient);

        let message: Message = Message {
            owner: recipient,
            message_id: message_id,
            sender_hash: sender_hash,
            encrypted_content: encrypted_content,
            encrypted_content_2: encrypted_content_2,
            timestamp: 0u32,
            is_read: false,
        };

        let proof: SentProof = SentProof {
            owner: self.caller,
            message_id: message_id,
            recipient_hash: recipient_hash,
            timestamp: 0u32,
        };

        return (message, proof, finalize_send_message(recipient_hash, message_id));
    }

    async function finalize_send_message(recipient_hash: field, message_id: field) {
        let exists: bool = Mapping::get_or_use(message_exists, message_id, false);
        assert(!exists);
        Mapping::set(message_exists, message_id, true);
        let count: u32 = Mapping::get_or_use(inbox_count, recipient_hash, 0u32);
        Mapping::set(inbox_count, recipient_hash, count + 1u32);
    }

    transition mark_read(message: Message) -> Message {
        assert_eq(message.owner, self.caller);
        return Message {
            owner: message.owner,
            message_id: message.message_id,
            sender_hash: message.sender_hash,
            encrypted_content: message.encrypted_content,
            encrypted_content_2: message.encrypted_content_2,
            timestamp: message.timestamp,
            is_read: true,
        };
    }

    async transition delete_message(message: Message) -> Future {
        assert_eq(message.owner, self.caller);
        let recipient_hash: field = BHP256::hash_to_field(self.caller);
        return finalize_delete_message(recipient_hash);
    }

    async function finalize_delete_message(recipient_hash: field) {
        let count: u32 = Mapping::get_or_use(inbox_count, recipient_hash, 1u32);
        Mapping::set(inbox_count, recipient_hash, count - 1u32);
    }
}
