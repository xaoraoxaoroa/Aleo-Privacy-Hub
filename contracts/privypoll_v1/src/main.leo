program privypoll_v1.aleo {
    // Non-upgradable constructor
    @noupgrade
    async constructor() {}

    record Poll {
        owner: address,
        poll_id: field,
        encrypted_question: field,
        option_count: u8,
        end_block: u32,
        created_at: u32,
    }

    record VoteReceipt {
        owner: address,
        poll_id: field,
        nullifier: field,
        voted_at: u32,
    }

    mapping poll_active: field => bool;
    mapping poll_total_votes: field => u32;
    mapping poll_option_votes: field => u32;
    mapping has_voted: field => bool;
    mapping poll_end_block: field => u32;

    async transition create_poll(
        poll_id: field,
        encrypted_question: field,
        option_count: u8,
        duration_blocks: u32
    ) -> (Poll, Future) {
        assert(option_count >= 2u8);
        assert(option_count <= 10u8);

        let poll: Poll = Poll {
            owner: self.caller,
            poll_id: poll_id,
            encrypted_question: encrypted_question,
            option_count: option_count,
            end_block: duration_blocks,
            created_at: 0u32,
        };

        return (poll, finalize_create_poll(poll_id, duration_blocks));
    }

    async function finalize_create_poll(poll_id: field, duration_blocks: u32) {
        let exists: bool = Mapping::get_or_use(poll_active, poll_id, false);
        assert(!exists);
        Mapping::set(poll_active, poll_id, true);
        Mapping::set(poll_total_votes, poll_id, 0u32);
        Mapping::set(poll_end_block, poll_id, duration_blocks);
    }

    async transition vote(
        poll_id: field,
        option_id: u8,
        secret: field
    ) -> (VoteReceipt, Future) {
        let voter_hash: field = BHP256::hash_to_field(self.caller);
        let nullifier: field = BHP256::hash_to_field(poll_id + voter_hash + secret);
        let vote_key: field = BHP256::hash_to_field(poll_id + option_id as field);

        let receipt: VoteReceipt = VoteReceipt {
            owner: self.caller,
            poll_id: poll_id,
            nullifier: nullifier,
            voted_at: 0u32,
        };

        return (receipt, finalize_vote(poll_id, vote_key, nullifier));
    }

    async function finalize_vote(poll_id: field, vote_key: field, nullifier: field) {
        let is_active: bool = Mapping::get_or_use(poll_active, poll_id, true);
        assert(is_active);
        let already_voted: bool = Mapping::get_or_use(has_voted, nullifier, false);
        assert(!already_voted);
        Mapping::set(has_voted, nullifier, true);
        let option_votes: u32 = Mapping::get_or_use(poll_option_votes, vote_key, 0u32);
        Mapping::set(poll_option_votes, vote_key, option_votes + 1u32);
        let total: u32 = Mapping::get_or_use(poll_total_votes, poll_id, 0u32);
        Mapping::set(poll_total_votes, poll_id, total + 1u32);
    }

    async transition end_poll(poll: Poll) -> (Poll, Future) {
        assert_eq(poll.owner, self.caller);

        let updated_poll: Poll = Poll {
            owner: poll.owner,
            poll_id: poll.poll_id,
            encrypted_question: poll.encrypted_question,
            option_count: poll.option_count,
            end_block: 0u32,
            created_at: poll.created_at,
        };

        return (updated_poll, finalize_end_poll(poll.poll_id));
    }

    async function finalize_end_poll(poll_id: field) {
        Mapping::set(poll_active, poll_id, false);
    }
}
