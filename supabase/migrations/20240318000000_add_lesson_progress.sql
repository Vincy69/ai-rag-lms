create table if not exists public.lesson_progress (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) not null,
    lesson_id uuid references public.lessons(id) not null,
    chapter_id uuid references public.chapters(id) not null,
    block_id uuid references public.skill_blocks(id) not null,
    is_completed boolean default false,
    completed_at timestamp with time zone default timezone('utc'::text, now()),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(user_id, lesson_id)
);

-- Add RLS policies
alter table public.lesson_progress enable row level security;

create policy "Users can manage their own lesson progress"
on public.lesson_progress
for all
to authenticated
using (auth.uid() = user_id);