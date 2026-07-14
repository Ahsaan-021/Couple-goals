-- Add 'busy' to the reason_status check constraint
ALTER TABLE statuses DROP CONSTRAINT IF EXISTS statuses_reason_status_check;
ALTER TABLE statuses ADD CONSTRAINT statuses_reason_status_check
  CHECK (reason_status IN ('working', 'busy', 'traveling', 'resting', 'meeting', 'focusing', 'commuting', 'available'));

-- Add 'thoughtful' to the emotional_status check constraint
ALTER TABLE statuses DROP CONSTRAINT IF EXISTS statuses_emotional_status_check;
ALTER TABLE statuses ADD CONSTRAINT statuses_emotional_status_check
  CHECK (emotional_status IN ('low_energy', 'need_space', 'miss_you', 'feeling_good', 'stressed', 'grateful', 'loving', 'thoughtful'));
