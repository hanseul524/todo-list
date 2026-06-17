# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

supabase.com에서 새 프로젝트를 생성합니다.

## 2. .env.local 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. SQL 실행 (Supabase Dashboard > SQL Editor)

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  created_at timestamptz default now() not null
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  is_done boolean default false not null,
  priority text check (priority in ('high','medium','low')) default 'medium' not null,
  due_date date,
  position integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table categories enable row level security;
alter table todos enable row level security;

create policy "본인 카테고리만 접근" on categories for all using (auth.uid() = user_id);
create policy "본인 투두만 접근" on todos for all using (auth.uid() = user_id);
```

## 4. Authentication 설정

Supabase Dashboard > Authentication > Providers 에서 Email 인증을 활성화합니다.

## 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속 후 `/login`에서 회원가입하면 됩니다.
