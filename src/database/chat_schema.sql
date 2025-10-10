-- Database schema for Team Chat System
-- PostgreSQL/Supabase compatible

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends existing user management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'zarzadzanie', 'wlasciciel', 'sekretariat', 'kadrowa', 'ksiegowa')),
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away', 'busy')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat channels table
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('public', 'private')),
    is_archived BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Channel members table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS channel_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(channel_id, user_id)
);

-- Chat messages table (both channel and direct messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For direct messages
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    mentions UUID[] DEFAULT '{}', -- Array of user IDs mentioned in message
    
    -- Constraint: message must be either in a channel OR direct (but not both)
    CONSTRAINT check_message_type CHECK (
        (channel_id IS NOT NULL AND receiver_id IS NULL) OR
        (channel_id IS NULL AND receiver_id IS NOT NULL)
    )
);

-- Message read status for direct messages
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Message attachments
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations (for organizing direct messages)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL, -- Array of user IDs
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING gin(participants);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_channels_updated_at BEFORE UPDATE ON chat_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update channel last activity when new message is sent
CREATE OR REPLACE FUNCTION update_channel_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.channel_id IS NOT NULL THEN
        UPDATE chat_channels 
        SET last_activity = NOW() 
        WHERE id = NEW.channel_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channel_activity AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_channel_last_activity();

-- RLS (Row Level Security) policies for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on business requirements)

-- Users can read all users but only update their own profile
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Channel access policies
CREATE POLICY "Users can view channels they are members of" ON chat_channels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM channel_members 
            WHERE channel_id = id AND user_id = auth.uid()
        ) OR type = 'public'
    );

CREATE POLICY "Channel admins can update channels" ON chat_channels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM channel_members 
            WHERE channel_id = id AND user_id = auth.uid() AND role = 'admin'
        )
    );

-- Channel members policies
CREATE POLICY "Users can view channel memberships" ON channel_members
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM channel_members cm 
            WHERE cm.channel_id = channel_id AND cm.user_id = auth.uid()
        )
    );

-- Message policies
CREATE POLICY "Users can view messages in their channels" ON chat_messages
    FOR SELECT USING (
        -- Channel messages: user is member of channel
        (channel_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM channel_members 
            WHERE channel_id = chat_messages.channel_id AND user_id = auth.uid()
        )) OR
        -- Direct messages: user is sender or receiver
        (receiver_id IS NOT NULL AND (sender_id = auth.uid() OR receiver_id = auth.uid()))
    );

CREATE POLICY "Users can send messages" ON chat_messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages" ON chat_messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Sample data for testing (optional)
-- INSERT INTO users (first_name, last_name, email, role) VALUES
-- ('Jan', 'Kowalski', 'jan.kowalski@firma.pl', 'administrator'),
-- ('Anna', 'Nowak', 'anna.nowak@firma.pl', 'ksiegowa'),
-- ('Piotr', 'Wiśniewski', 'piotr.wisniewski@firma.pl', 'kadrowa');

-- Views for easier data access
CREATE OR REPLACE VIEW channel_with_members AS
SELECT 
    c.*,
    array_agg(
        json_build_object(
            'user_id', cm.user_id,
            'role', cm.role,
            'joined_at', cm.joined_at,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'status', u.status
        )
    ) as members
FROM chat_channels c
LEFT JOIN channel_members cm ON c.id = cm.channel_id
LEFT JOIN users u ON cm.user_id = u.id
GROUP BY c.id, c.name, c.description, c.type, c.is_archived, c.created_by, c.created_at, c.updated_at, c.last_activity;

CREATE OR REPLACE VIEW conversation_with_last_message AS
SELECT 
    c.*,
    (
        SELECT row_to_json(msg)
        FROM (
            SELECT cm.id, cm.sender_id, cm.receiver_id, cm.content, cm.created_at, cm.message_type,
                   u.first_name as sender_first_name, u.last_name as sender_last_name
            FROM chat_messages cm
            JOIN users u ON cm.sender_id = u.id
            WHERE (cm.sender_id = ANY(c.participants) AND cm.receiver_id = ANY(c.participants))
            ORDER BY cm.created_at DESC
            LIMIT 1
        ) msg
    ) as last_message
FROM conversations c;